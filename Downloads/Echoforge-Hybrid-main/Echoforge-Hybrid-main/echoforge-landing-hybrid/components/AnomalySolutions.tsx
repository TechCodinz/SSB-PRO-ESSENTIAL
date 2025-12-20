"use client";

interface AnomalySolution {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  actions: string[];
  icon: string;
}

interface AnomalySolutionsProps {
  anomalyCount: number;
  accuracy: number;
  dataType?: string;
}

export default function AnomalySolutions({ anomalyCount, accuracy, dataType = "general" }: AnomalySolutionsProps) {
  const getSolutions = (): AnomalySolution[] => {
    const solutions: AnomalySolution[] = [];

    if (anomalyCount === 0) {
      return [{
        title: "No Anomalies Detected",
        description: "Your data appears normal with no significant outliers detected.",
        severity: "low",
        actions: [
          "Continue monitoring with regular analyses",
          "Set up scheduled scans for continuous monitoring",
          "Review your detection sensitivity settings if expected anomalies are missing"
        ],
        icon: "✅"
      }];
    }

    // Critical threshold
    const anomalyRate = anomalyCount / 100; // Simplified calculation
    
    if (anomalyRate > 0.1 || anomalyCount > 10) {
      solutions.push({
        title: "High Anomaly Rate Detected",
        description: `${anomalyCount} anomalies found. This is higher than expected and requires immediate attention.`,
        severity: "critical",
        actions: [
          "🔴 Review all flagged data points immediately",
          "🔍 Investigate root causes of anomalies",
          "🛡️ Implement additional security measures if fraud-related",
          "📊 Run detailed forensic analysis on flagged transactions",
          "👥 Alert relevant team members and stakeholders"
        ],
        icon: "🚨"
      });
    }

    // Data type specific solutions
    if (dataType?.toLowerCase().includes('financial') || dataType?.toLowerCase().includes('transaction')) {
      solutions.push({
        title: "Financial Anomaly Response",
        description: "Detected unusual patterns in financial transactions that may indicate fraud or errors.",
        severity: anomalyCount > 5 ? "high" : "medium",
        actions: [
          "💳 Review flagged transactions for unauthorized activity",
          "🔒 Temporarily freeze suspicious accounts pending investigation",
          "📞 Contact affected customers to verify transactions",
          "📝 Document all anomalies for compliance reporting",
          "🔐 Enable two-factor authentication for high-risk accounts",
          "📧 Set up real-time alerts for similar patterns"
        ],
        icon: "💰"
      });
    }

    if (dataType?.toLowerCase().includes('network') || dataType?.toLowerCase().includes('traffic')) {
      solutions.push({
        title: "Network Security Recommendations",
        description: "Unusual network activity detected that may indicate security threats or performance issues.",
        severity: anomalyCount > 3 ? "high" : "medium",
        actions: [
          "🛡️ Check firewall logs for unauthorized access attempts",
          "🌐 Review IP addresses of flagged connections",
          "🔍 Scan for malware and intrusion attempts",
          "📊 Analyze bandwidth usage patterns",
          "🚫 Block suspicious IP addresses",
          "📈 Increase monitoring frequency for next 24-48 hours"
        ],
        icon: "🌐"
      });
    }

    if (dataType?.toLowerCase().includes('iot') || dataType?.toLowerCase().includes('sensor')) {
      solutions.push({
        title: "IoT Sensor Diagnostics",
        description: "Sensor readings outside normal parameters detected.",
        severity: anomalyCount > 2 ? "high" : "medium",
        actions: [
          "🔧 Inspect physical sensors for malfunction",
          "📡 Check sensor calibration settings",
          "🔋 Verify power supply and battery levels",
          "🌡️ Review environmental conditions",
          "🔄 Reset and recalibrate affected sensors",
          "📊 Compare with backup sensor data"
        ],
        icon: "📡"
      });
    }

    // General recommendations
    solutions.push({
      title: "Next Steps & Best Practices",
      description: "Recommended actions to investigate and resolve detected anomalies.",
      severity: "medium",
      actions: [
        "📋 Export detailed report for team review",
        "📊 Compare with historical data patterns",
        "🔄 Run additional analyses with different sensitivity settings",
        "📝 Document findings and remediation steps",
        "⏰ Schedule follow-up analysis in 24 hours",
        "📈 Set up automated monitoring for similar patterns"
      ],
      icon: "📋"
    });

    // Performance optimization
    if (accuracy < 0.9) {
      solutions.push({
        title: "Improve Detection Accuracy",
        description: `Current accuracy: ${(accuracy * 100).toFixed(1)}%. Consider these optimizations.`,
        severity: "low",
        actions: [
          "🎯 Try Consensus Mode for highest accuracy (99%)",
          "📊 Collect more training data",
          "⚙️ Adjust sensitivity parameters",
          "🧠 Use multiple models in ensemble",
          "🔧 Fine-tune detection thresholds",
          "📈 Incorporate domain-specific features"
        ],
        icon: "🎯"
      });
    }

    return solutions;
  };

  const solutions = getSolutions();

  const severityColors = {
    critical: "from-red-500/20 to-red-600/10 border-red-500/50",
    high: "from-orange-500/20 to-orange-600/10 border-orange-500/50",
    medium: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/50",
    low: "from-green-500/20 to-green-600/10 border-green-500/50"
  };

  const severityIcons = {
    critical: "🚨",
    high: "⚠️",
    medium: "ℹ️",
    low: "✅"
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">🧠 AI-Powered Solutions & Recommendations</h2>
        <p className="text-white/80">
          Based on {anomalyCount} detected anomalies with {(accuracy * 100).toFixed(1)}% confidence
        </p>
      </div>

      {solutions.map((solution, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${severityColors[solution.severity]} border rounded-xl p-6`}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{solution.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{solution.title}</h3>
                <span className="text-2xl">{severityIcons[solution.severity]}</span>
              </div>
              <p className="text-white/80">{solution.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-sm uppercase tracking-wide mb-3">
              Recommended Actions:
            </div>
            {solution.actions.map((action, actionIndex) => (
              <div
                key={actionIndex}
                className="flex items-start gap-3 bg-black/20 rounded-lg p-3 hover:bg-black/30 transition-all"
              >
                <span className="text-blue-400 font-bold">{actionIndex + 1}.</span>
                <span className="flex-1">{action}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-xl transition-all text-left">
            <div className="text-2xl mb-2">📥</div>
            <div className="font-semibold mb-1">Export Report</div>
            <div className="text-xs text-white/60">PDF with full details</div>
          </button>
          <button className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-xl transition-all text-left">
            <div className="text-2xl mb-2">📧</div>
            <div className="font-semibold mb-1">Email Alert</div>
            <div className="text-xs text-white/60">Send to team</div>
          </button>
          <button className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl transition-all text-left">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold mb-1">Re-analyze</div>
            <div className="text-xs text-white/60">Different settings</div>
          </button>
        </div>
      </div>
    </div>
  );
}
