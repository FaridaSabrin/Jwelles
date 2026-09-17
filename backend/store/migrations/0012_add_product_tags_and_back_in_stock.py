from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0011_emailverificationotp"),
    ]

    operations = [
        # New reusable tag model
        migrations.CreateModel(
            name="ProductTag",
            fields=[
                ("id", models.BigAutoField(
                    auto_created=True,
                    primary_key=True,
                    serialize=False,
                    verbose_name="ID"
                )),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("kind", models.CharField(
                    choices=[
                        ("occasion", "Occasion"),
                        ("style", "Style"),
                        ("gift", "Gift"),
                        ("special", "Special"),
                    ],
                    default="occasion",
                    max_length=20,
                )),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["kind", "name"],
            },
        ),

        migrations.AddConstraint(
            model_name="producttag",
            constraint=models.UniqueConstraint(
                fields=("kind", "slug"),
                name="unique_tag_kind_slug",
            ),
        ),

        # New back-in-stock tracking fields on Product
        migrations.AddField(
            model_name="product",
            name="previous_stock",
            field=models.PositiveIntegerField(default=0),
        ),

        migrations.AddField(
            model_name="product",
            name="back_in_stock",
            field=models.BooleanField(
                default=False,
                help_text="Set automatically when stock goes from 0 to >0.",
            ),
        ),

        # M2M tags on Product
        migrations.AddField(
            model_name="product",
            name="tags",
            field=models.ManyToManyField(
                blank=True,
                related_name="products",
                to="store.producttag",
            ),
        ),
    ]