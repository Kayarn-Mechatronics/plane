# Generated by Django 4.2.3 on 2023-09-14 13:17

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0044_auto_20230913_0709'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkspaceView',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=255, verbose_name='View Name')),
                ('description', models.TextField(blank=True, verbose_name='View Description')),
                ('query', models.JSONField(verbose_name='View Query')),
                ('access', models.PositiveSmallIntegerField(choices=[(0, 'Private'), (1, 'Public')], default=1)),
                ('query_data', models.JSONField(default=dict)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workspace_views', to='db.workspace')),
            ],
            options={
                'verbose_name': 'Workspace View',
                'verbose_name_plural': 'Workspace Views',
                'db_table': 'workspace_views',
                'ordering': ('-created_at',),
            },
        ),
    ]
