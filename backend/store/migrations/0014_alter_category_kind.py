# store/migrations/00XX_alter_category_kind.py
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0013_seed_product_tags"),
    ]

    operations = [
        migrations.AlterField(
            model_name="category",
            name="kind",
            field=models.CharField(
                choices=[
                    ("metal", "Metal"),
                    ("jewellery", "Jewellery type"),
                    ("stone", "Stone"),
                ],
                default="jewellery",
                max_length=20,
            ),
        ),
    ]