import numpy as np
from models.classifier import FullyConnectedLayer
from models.softmax import softmax


def test_softmax():
    """Test if Softmax normalizes correctly."""
    logits = np.array([2.0, 1.0])
    probabilities = softmax(logits)

    assert np.isclose(sum(probabilities), 1.0), "Softmax should sum to 1"
    assert len(probabilities) == 2, "Softmax should return probabilities for both classes"


def test_classifier():
    """Test if classifier outputs valid predictions."""
    fc_layer = FullyConnectedLayer(input_dim=300, output_dim=2)
    sample_input = np.random.uniform(-0.5, 0.5, 300)
    output = fc_layer.forward(sample_input)

    assert len(output) == 2, "Classifier should return two class logits"


if __name__ == "__main__":
    test_softmax()
    test_classifier()
    print("All classifier tests passed!")
