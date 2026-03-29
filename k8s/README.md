# Sysmon on Kubernetes

This directory deploys the Django backend, React frontend (nginx), and PostgreSQL. Monitoring uses **Prometheus + Grafana** (metrics). Logging uses the **ELK** stack (**Elasticsearch**, **Logstash**, **Kibana**) via Elastic Helm charts, with **Filebeat** shipping container logs.

## Prerequisites

- Kubernetes cluster (1.25+)
- `kubectl` and `kustomize` (built into kubectl 1.14+)
- Docker (to build images)
- Helm 3 (for Prometheus/Grafana and ELK)

## 1. Build and load images

From the repository root:

```bash
docker build -t sysmon-backend:latest ./backend
docker build -t sysmon-frontend:latest ./frontend
```

For a local cluster (kind, minikube, k3d), load images into the cluster, for example:

```bash
kind load docker-image sysmon-backend:latest sysmon-frontend:latest
# or: minikube image load ...
```

For a remote registry, tag and push, then edit `k8s/base/backend.yaml` and `k8s/base/frontend.yaml` image fields.

## 2. Secrets

Edit `k8s/base/sysmon-secrets.yaml` and set strong `password` and `django-secret-key` for production. Apply everything:

```bash
kubectl apply -k k8s/
```

Verify:

```bash
kubectl get pods -n sysmon
kubectl port-forward -n sysmon svc/sysmon-frontend 8080:80
```

Open `http://localhost:8080`. The backend exposes Prometheus metrics at `http://<backend-pod-ip>:8000/metrics`.

## 3. Prometheus and Grafana

Install the [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) chart so the Prometheus Operator and Grafana are available:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f k8s/monitoring/values-kube-prometheus-stack.yaml
```

Apply the `ServiceMonitor` so Prometheus scrapes the backend `/metrics` endpoint:

```bash
kubectl apply -f k8s/monitoring/servicemonitor-sysmon.yaml
```

If your Prometheus release uses a label selector for `ServiceMonitor` resources, edit `k8s/monitoring/servicemonitor-sysmon.yaml` and set `metadata.labels` to match your chart (often `release: <helm-release-name>`). Alternatively, the provided `values-kube-prometheus-stack.yaml` sets `serviceMonitorSelectorNilUsesHelmValues: false` so all `ServiceMonitor` objects cluster-wide are picked up.

**Grafana:** get the admin password from the chart (or the value you set) and port-forward:

```bash
kubectl get secret -n monitoring kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 -d
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

Add a Prometheus data source if needed (often preconfigured). Query metrics with names like `django_http_*` and `django_db_*`.

## 4. ELK (Elasticsearch, Logstash, Kibana) and Filebeat

Add the Elastic Helm repository:

```bash
helm repo add elastic https://helm.elastic.co
helm repo update
```

Install Elasticsearch, then Kibana, then optionally Logstash, then Filebeat:

```bash
helm install elasticsearch elastic/elasticsearch -n elk --create-namespace \
  -f k8s/logging/values-elasticsearch.yaml

helm install kibana elastic/kibana -n elk -f k8s/logging/values-kibana.yaml

# Optional pipeline: Filebeat → Logstash → Elasticsearch
helm install logstash elastic/logstash -n elk -f k8s/logging/values-logstash.yaml
```

**Filebeat:** the sample `values-filebeat.yaml` sends logs **directly to Elasticsearch**. If you use Logstash, change the `output` section in that file to `output.logstash` pointing at the Logstash service (see Elastic documentation).

```bash
helm install filebeat elastic/filebeat -n elk -f k8s/logging/values-filebeat.yaml
```

**Kibana:**

```bash
kubectl port-forward -n elk svc/kibana-kibana 5601:5601
```

Open `http://localhost:5601` and create an index pattern such as `filebeat-*` or `logstash-*` depending on your pipeline.

**Resource note:** Elasticsearch and Logstash are memory-heavy. For small clusters, install only Elasticsearch + Kibana + Filebeat first, and add Logstash when you need extra parsing/routing.

## 5. Optional Ingress

Uncomment `base/ingress.yaml` in `k8s/kustomization.yaml`, set `spec.rules[0].host`, install an Ingress controller, and re-apply.

## Host-level monitoring

The Docker Compose setup uses `network_mode: host` and `privileged` for deep host metrics. In Kubernetes, pods are isolated; collecting the same data usually requires a **DaemonSet** with `hostPID`/`hostNetwork` or node-exporter-style agents. The stack above still gives you **application metrics** (Django) and **container logs** (Filebeat).
