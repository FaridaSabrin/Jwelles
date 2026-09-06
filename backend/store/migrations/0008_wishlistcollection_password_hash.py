from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0007_wishlistcollection_wishlistcollectionitem_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='wishlistcollection',
            name='password_hash',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]