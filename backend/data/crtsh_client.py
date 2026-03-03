"""
crt.sh Certificate Transparency Log Client
Passive intelligence gathering — no direct contact with target infrastructure.
"""
import httpx
from typing import List, Dict, Any, Optional


class CrtshClient:
    """
    Queries the crt.sh public CT log aggregator for certificate records
    associated with a given domain. This is entirely passive (Mode 1).
    """
    BASE_URL = "https://crt.sh"

    def __init__(self, timeout: float = 15.0):
        self.timeout = timeout

    async def get_certificates(self, domain: str) -> List[Dict[str, Any]]:
        """
        Fetch certificate transparency log entries for a domain.
        Returns a list of certificate records with issuer, validity, and SAN info.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    self.BASE_URL,
                    params={"q": f"%.{domain}", "output": "json"},
                )
                response.raise_for_status()
                raw = response.json()

                return [
                    {
                        "id": entry.get("id"),
                        "issuer_name": entry.get("issuer_name", "Unknown"),
                        "common_name": entry.get("common_name", ""),
                        "name_value": entry.get("name_value", ""),
                        "not_before": entry.get("not_before", ""),
                        "not_after": entry.get("not_after", ""),
                        "serial_number": entry.get("serial_number", ""),
                    }
                    for entry in raw[:50]  # Cap to 50 entries for performance
                ]

        except Exception as e:
            print(f"[crt.sh] Fetch failed for {domain}: {e}. Returning mock data.")
            return self._mock_certificates(domain)

    @staticmethod
    def _mock_certificates(domain: str) -> List[Dict[str, Any]]:
        """Fallback mock data for demo/offline use."""
        base = domain.split(".")[-2] if "." in domain else domain
        return [
            {
                "id": 10001,
                "issuer_name": "C=US, O=Let's Encrypt, CN=R3",
                "common_name": f"*.{base}.edu",
                "name_value": f"payments-api.{base}.edu\nvpn.{base}.edu",
                "not_before": "2024-01-15",
                "not_after": "2025-04-15",
                "serial_number": "03:a1:b2:c3:d4:e5:f6:00:11:22",
            },
            {
                "id": 10002,
                "issuer_name": "C=US, O=DigiCert Inc, CN=DigiCert SHA2 Extended Validation Server CA",
                "common_name": f"research-portal.{base}.edu",
                "name_value": f"research-portal.{base}.edu",
                "not_before": "2023-06-01",
                "not_after": "2025-06-01",
                "serial_number": "0a:bb:cc:dd:ee:ff:00:11:22:33",
            },
            {
                "id": 10003,
                "issuer_name": "C=US, O=Let's Encrypt, CN=R3",
                "common_name": f"student-health.{base}.edu",
                "name_value": f"student-health.{base}.edu",
                "not_before": "2024-03-10",
                "not_after": "2024-06-08",
                "serial_number": "04:de:ad:be:ef:ca:fe:ba:be:00",
            },
        ]
