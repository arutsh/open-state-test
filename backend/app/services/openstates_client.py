from typing import Any

import httpx

from app.config import get_settings


class OpenStatesClient:
    def __init__(self) -> None:
        settings = get_settings()
        self._base_url = settings.openstates_base_url
        self._api_key = settings.openstates_api_key

    def _get_all_pages(
        self, path: str, params: dict[str, Any]
    ) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        page = 1
        per_page = 50

        with httpx.Client(
            base_url=self._base_url,
            headers={"x-api-key": self._api_key},
            timeout=30.0,
        ) as client:
            while True:
                response = client.get(
                    path, params={**params, "page": page, "per_page": per_page}
                )
                response.raise_for_status()
                payload = response.json()
                results.extend(payload.get("results", []))

                pagination = payload.get("pagination", {})
                max_page = pagination.get("max_page", page)
                if page >= max_page:
                    break
                page += 1

        return results

    def get_jurisdictions(
        self, classification: str = "state"
    ) -> list[dict[str, Any]]:
        return self._get_all_pages(
            "/jurisdictions", {"classification": classification}
        )

    def get_people(self, jurisdiction_id: str) -> list[dict[str, Any]]:
        return self._get_all_pages(
            "/people",
            {"jurisdiction": jurisdiction_id},
        )
