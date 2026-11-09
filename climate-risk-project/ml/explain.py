import torch
import numpy as np

class IntegratedGradientsXAI:
    """
    Explainable AI (XAI) using Integrated Gradients for PyTorch 1D CNN
    Path integral from neutral baseline x0 to input x:
    Attribution_i = (x_i - x0_i) * (1/M) * sum_{m=1}^M (grad_{x_i} F_c(x0 + m/M * (x - x0)))
    """
    def __init__(self, model, baseline=None, steps=50):
        self.model = model
        self.model.eval()
        self.steps = steps
        # Default baseline in normalized feature space (0 or neutral mean)
        self.baseline = baseline if baseline is not None else torch.zeros((1, 1, 4), dtype=torch.float32)

    def explain(self, input_tensor, target_class=None):
        """
        input_tensor: shape (1, 1, 4)
        target_class: int (0: LOW, 1: MEDIUM, 2: HIGH). If None, uses argmax(logits)
        """
        with torch.no_grad():
            logits = self.model(input_tensor)
            if target_class is None:
                target_class = torch.argmax(logits, dim=1).item()
        
        # Linear interpolation between baseline and input
        alphas = torch.linspace(0.0, 1.0, self.steps + 1)
        interpolated_inputs = []
        for alpha in alphas[1:]: # exclude exact baseline step 0
            step_input = self.baseline + alpha * (input_tensor - self.baseline)
            step_input.requires_grad = True
            interpolated_inputs.append(step_input)
        
        # Accumulate gradients
        total_gradients = torch.zeros_like(input_tensor)
        
        for step_input in interpolated_inputs:
            output = self.model(step_input)
            target_logit = output[0, target_class]
            
            grad = torch.autograd.grad(outputs=target_logit, inputs=step_input)[0]
            total_gradients += grad

        avg_gradients = total_gradients / self.steps
        # Path integral
        attributions = (input_tensor - self.baseline) * avg_gradients
        attributions_np = attributions.detach().cpu().numpy().flatten()

        # Compute percentage influence
        abs_sum = np.sum(np.abs(attributions_np))
        if abs_sum == 0:
            abs_sum = 1e-6
        percent_contributions = (attributions_np / abs_sum) * 100

        feature_names = ['NDVI', 'Rainfall', 'Temperature', 'Soil Moisture']
        class_names = ['LOW RISK', 'MEDIUM RISK', 'HIGH RISK']

        explanation_text = (
            f"Integrated Gradients attributed {percent_contributions[0]:.1f}% to NDVI, "
            f"{percent_contributions[1]:.1f}% to Rainfall, "
            f"{percent_contributions[2]:.1f}% to Temperature, and "
            f"{percent_contributions[3]:.1f}% to Soil Moisture towards the {class_names[target_class]} prediction."
        )

        return {
            'target_class': target_class,
            'predicted_class_name': class_names[target_class],
            'attributions': attributions_np.tolist(),
            'percentage_contributions': {
                'ndvi': round(float(percent_contributions[0]), 2),
                'rainfall': round(float(percent_contributions[1]), 2),
                'temperature': round(float(percent_contributions[2]), 2),
                'soil_moisture': round(float(percent_contributions[3]), 2),
            },
            'explanation': explanation_text,
            'disclaimer': "Integrated Gradients explains how input features influence the model prediction. It does not prove physical causation."
        }
