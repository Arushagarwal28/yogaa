export function calcBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const h = parseFloat(heightCm) / 100;
  return (parseFloat(weightKg) / (h * h)).toFixed(1);
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
  if (bmi < 25)   return { label: "Healthy",     color: "#4ade80" };
  if (bmi < 30)   return { label: "Overweight",  color: "#fbbf24" };
  return             { label: "Obese",        color: "#f87171" };
}