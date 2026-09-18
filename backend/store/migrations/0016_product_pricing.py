from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0015_passwordresetotp_passwordresettoken"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="pricing_mode",
            field=models.CharField(
                choices=[
                    ("auto", "Auto (derive from live data)"),
                    ("static", "Static (use stored price)"),
                ],
                default="auto",
                help_text=(
                    "Auto: price is calculated from live market data when the "
                    "product has a recognized metal_type and a weight. Static: "
                    "the stored price is always used."
                ),
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="making_charge_percent",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0"),
                max_digits=5,
                validators=[
                    MinValueValidator(0),
                    MaxValueValidator(100),
                ],
                help_text="Making charges as % of metal value (live pricing only).",
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="stone_value",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0"),
                max_digits=12,
                validators=[MinValueValidator(0)],
                help_text="Manual stone value in INR (diamonds, rubies, etc.).",
            ),
        ),
    ]