import torch
import torch.nn as nn
import torch.nn.functional as F

class ClimateRisk1DCNN(nn.Module):
    """
    1D Convolutional Neural Network for Climate Risk Prediction
    Input: 4 climate indicators [NDVI, Rainfall, Temperature, Soil Moisture]
    Architecture based on project presentation:
    - Input shape: (Batch, 1, 4)
    - Conv1D: 16 filters
    - Conv1D: 32 filters
    - Adaptive Pooling: AdaptiveAvgPool1d(1)
    - FC Layers: 32 -> 16 -> 3 classes [LOW, MEDIUM, HIGH]
    """
    def __init__(self, num_classes=3):
        super(ClimateRisk1DCNN, self).__init__()
        # Conv layer 1: 1 in_channel -> 16 filters, kernel 2, pad 1
        self.conv1 = nn.Conv1d(in_channels=1, out_channels=16, kernel_size=2, padding=1)
        self.bn1 = nn.BatchNorm1d(16)
        
        # Conv layer 2: 16 -> 32 filters, kernel 2, pad 1
        self.conv2 = nn.Conv1d(in_channels=16, out_channels=32, kernel_size=2, padding=1)
        self.bn2 = nn.BatchNorm1d(32)
        
        # Adaptive pooling to collapse temporal/feature dimension to 1
        self.pool = nn.AdaptiveAvgPool1d(1)
        
        # Fully connected layers
        self.fc1 = nn.Linear(32, 16)
        self.dropout = nn.Dropout(0.2)
        self.fc2 = nn.Linear(16, num_classes)

    def forward(self, x):
        # x shape: (batch_size, 1, 4)
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = self.pool(x) # shape: (batch_size, 32, 1)
        x = x.squeeze(-1) # shape: (batch_size, 32)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        logits = self.fc2(x) # shape: (batch_size, 3)
        return logits
