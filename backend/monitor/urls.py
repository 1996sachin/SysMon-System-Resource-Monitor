from django.urls import path
from . import views

urlpatterns = [
    path('live/',      views.live_stats,        name='live-stats'),
    path('snapshot/',  views.snapshot_and_save, name='snapshot'),
    path('history/',   views.history,            name='history'),
    path('stacks/',    views.stack_stats,        name='stacks'),
    path('processes/', views.process_list,       name='processes'),
]
