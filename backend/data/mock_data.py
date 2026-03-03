MOCK_CBOM = [
    {
        "hostname": "payments-api.institution.edu",
        "ip_address": "192.168.1.10",
        "algorithm_strength": "RSA-2048",
        "tls_version": "TLS 1.2",
        "semantic_classification": "High-sensitivity financial transaction endpoint",
        "semantic_sensitivity_score": 9,
        "interceptability_score": 8,
        "estimated_migration_months": 18
    },
    {
        "hostname": "vpn.institution.edu",
        "ip_address": "192.168.1.15",
        "algorithm_strength": "ECDSA-P256",
        "tls_version": "TLS 1.3",
        "semantic_classification": "Credential and session gateway",
        "semantic_sensitivity_score": 9,
        "interceptability_score": 5,
        "estimated_migration_months": 24
    },
    {
        "hostname": "research-portal.institution.edu",
        "ip_address": "10.0.0.5",
        "algorithm_strength": "RSA-4096",
        "tls_version": "TLS 1.2",
        "semantic_classification": "Long-lived sensitive data repository",
        "semantic_sensitivity_score": 8,
        "interceptability_score": 3,
        "estimated_migration_months": 12
    },
    {
        "hostname": "www.institution.edu",
        "ip_address": "10.0.0.100",
        "algorithm_strength": "RSA-2048",
        "tls_version": "TLS 1.2",
        "semantic_classification": "Public marketing page",
        "semantic_sensitivity_score": 2,
        "interceptability_score": 9,
        "estimated_migration_months": 6
    },
    {
        "hostname": "student-health.institution.edu",
        "ip_address": "10.0.0.50",
        "algorithm_strength": "RSA-2048",
        "tls_version": "TLS 1.1",
        "semantic_classification": "Protected Health Information (HIPAA)",
        "semantic_sensitivity_score": 10,
        "interceptability_score": 7,
        "estimated_migration_months": 36
    }
]
