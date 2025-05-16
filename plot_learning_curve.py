import json
import matplotlib.pyplot as plt
from dateutil.parser import parse
from itertools import accumulate
from config.settings import summery_of_results_learning

def plot_learning_curve(summary_path):
    with open(summary_path, 'r') as f:
        runs = json.load(f)

    runs.sort(key=lambda x: parse(x['timestamp']))

    total_logs_list = [run.get('total_logs', 0) for run in runs]
    cumulative_logs = list(accumulate(total_logs_list))

    accuracies = [run['accuracy'] for run in runs]
    precisions = [run['precision'] for run in runs]
    recalls = [run['recall'] for run in runs]
    f1_scores = [run['f1_score'] for run in runs]

    plt.figure(figsize=(10,6))
    plt.plot(cumulative_logs, accuracies, label='Accuracy', marker='o', linewidth=2)
    plt.plot(cumulative_logs, precisions, label='Precision', linestyle='--', marker='s', linewidth=2)
    plt.plot(cumulative_logs, recalls, label='Recall', linestyle='-.', marker='^', linewidth=2)
    plt.plot(cumulative_logs, f1_scores, label='F1 Score', linestyle=':', marker='d', linewidth=2)

    plt.xlabel('Amount of Logs Learned')
    plt.ylabel('Score')
    plt.title('Machine Learning Performance Over Amount of Logs')
    plt.legend()
    plt.grid(True)
    plt.show()

plot_learning_curve(summery_of_results_learning)
