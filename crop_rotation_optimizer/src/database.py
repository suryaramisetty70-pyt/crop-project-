"""
SQLite Persistence Module for Academic Project Records
Stores prediction records and multi-season rotation plans using parameterized queries.
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

class DatabaseManager:
    def __init__(self, db_path: str = "crop_rotation.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    n REAL NOT NULL,
                    p REAL NOT NULL,
                    k REAL NOT NULL,
                    temperature REAL NOT NULL,
                    humidity REAL NOT NULL,
                    ph REAL NOT NULL,
                    rainfall REAL NOT NULL,
                    previous_crop TEXT,
                    recommended_crop TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    top_candidates TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rotation_plans (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    field_name TEXT NOT NULL,
                    seasons_count INTEGER NOT NULL,
                    start_season TEXT NOT NULL,
                    sequence_json TEXT NOT NULL
                )
            """)
            conn.commit()

    def save_prediction(
        self,
        inputs: Dict[str, float],
        recommended_crop: str,
        confidence: float,
        top_candidates: List[Dict[str, Any]],
        previous_crop: Optional[str] = None
    ) -> int:
        timestamp = datetime.utcnow().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO predictions (
                    timestamp, n, p, k, temperature, humidity, ph, rainfall,
                    previous_crop, recommended_crop, confidence, top_candidates
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                timestamp, inputs["N"], inputs["P"], inputs["K"],
                inputs["temperature"], inputs["humidity"], inputs["ph"], inputs["rainfall"],
                previous_crop or "None", recommended_crop, confidence, json.dumps(top_candidates)
            ))
            conn.commit()
            return cursor.lastrowid

    def save_rotation_plan(
        self,
        field_name: str,
        seasons_count: int,
        start_season: str,
        sequence: List[Dict[str, Any]]
    ) -> int:
        timestamp = datetime.utcnow().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO rotation_plans (
                    timestamp, field_name, seasons_count, start_season, sequence_json
                ) VALUES (?, ?, ?, ?, ?)
            """, (timestamp, field_name, seasons_count, start_season, json.dumps(sequence)))
            conn.commit()
            return cursor.lastrowid

    def get_predictions(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            result = []
            for r in rows:
                item = dict(r)
                item["top_candidates"] = json.loads(item["top_candidates"])
                result.append(item)
            return result

    def get_rotation_plans(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rotation_plans ORDER BY id DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            result = []
            for r in rows:
                item = dict(r)
                item["sequence"] = json.loads(item["sequence_json"])
                result.append(item)
            return result

    def delete_record(self, table: str, record_id: int) -> bool:
        if table not in ["predictions", "rotation_plans"]:
            raise ValueError(f"Invalid table name: {table}")
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"DELETE FROM {table} WHERE id = ?", (record_id,))
            conn.commit()
            return cursor.rowcount > 0

    def clear_all_history(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM predictions")
            cursor.execute("DELETE FROM rotation_plans")
            conn.commit()
