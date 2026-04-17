# ml-service/app/cuckoo_client.py

import requests
import time
import os
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)


class CuckooClient:
    """
    Client for interacting with Cuckoo Sandbox API
    
    Handles file submission, status checking, and report retrieval
    """
    
    def __init__(self, host: str = "http://localhost:8090", api_token: Optional[str] = None):
        """
        Initialize Cuckoo client
        
        Args:
            host: Cuckoo REST API URL
            api_token: Optional API token for authentication
        """
        self.host = host.rstrip('/')
        self.api_url = f"{self.host}/api"
        self.api_token = api_token
        
        self.headers = {}
        if api_token:
            self.headers['Authorization'] = f'Bearer {api_token}'
        
        logger.info(f"Cuckoo client initialized: {self.api_url}")
    
    def submit_file(self, file_path: str, timeout: int = 300) -> Optional[int]:
        """
        Submit file to Cuckoo for analysis
        
        Args:
            file_path: Path to file to analyze
            timeout: Request timeout in seconds
            
        Returns:
            Cuckoo task ID or None if failed
        """
        
        url = f"{self.api_url}/tasks/create/file"
        
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return None
        
        try:
            with open(file_path, "rb") as f:
                files = {"file": (os.path.basename(file_path), f)}
                
                response = requests.post(
                    url,
                    files=files,
                    headers=self.headers,
                    timeout=timeout
                )
            
            if response.status_code == 200:
                data = response.json()
                task_id = data.get("task_id")
                logger.info(f"✓ File submitted to Cuckoo. Task ID: {task_id}")
                return task_id
            else:
                logger.error(f"✗ Cuckoo submission failed: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.ConnectionError:
            logger.error(f"✗ Cannot connect to Cuckoo at {self.host}")
            logger.error(f"  Make sure Cuckoo is running: cuckoo")
            return None
        except Exception as e:
            logger.error(f"✗ Error submitting file to Cuckoo: {e}")
            return None
    
    def get_task_status(self, task_id: int) -> str:
        """
        Get analysis status
        
        Args:
            task_id: Cuckoo task ID
            
        Returns:
            Status string: pending, running, completed, reported, failed
        """
        
        url = f"{self.api_url}/tasks/view/{task_id}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                status = data.get("task", {}).get("status", "unknown")
                return status
            else:
                logger.warning(f"Failed to get task status: {response.status_code}")
                return "error"
                
        except Exception as e:
            logger.error(f"Error getting task status: {e}")
            return "error"
    
    def wait_for_completion(
        self, 
        task_id: int, 
        max_wait: int = 600, 
        poll_interval: int = 10
    ) -> bool:
        """
        Wait for analysis to complete
        
        Args:
            task_id: Cuckoo task ID
            max_wait: Maximum wait time in seconds
            poll_interval: Polling interval in seconds
            
        Returns:
            True if completed successfully, False otherwise
        """
        
        start_time = time.time()
        
        logger.info(f"Waiting for Cuckoo task {task_id} to complete...")
        
        while time.time() - start_time < max_wait:
            status = self.get_task_status(task_id)
            
            if status == "reported":
                elapsed = time.time() - start_time
                logger.info(f"✓ Analysis completed in {elapsed:.1f} seconds")
                return True
            elif status in ["failed", "error"]:
                logger.error(f"✗ Analysis failed for task {task_id}")
                return False
            
            logger.debug(f"Status: {status}. Waiting...")
            time.sleep(poll_interval)
        
        logger.error(f"✗ Timeout waiting for task {task_id}")
        return False
    
    def get_report(self, task_id: int, report_format: str = "json") -> Optional[Dict]:
        """
        Get analysis report
        
        Args:
            task_id: Cuckoo task ID
            report_format: Report format (json, html, etc.)
            
        Returns:
            Report dictionary or None
        """
        
        url = f"{self.api_url}/tasks/report/{task_id}/{report_format}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=60)
            
            if response.status_code == 200:
                logger.info(f"✓ Retrieved report for task {task_id}")
                return response.json()
            else:
                logger.error(f"✗ Failed to get report: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting report: {e}")
            return None
    
    def extract_api_calls(self, report: Dict) -> str:
        """
        Extract API call sequence from Cuckoo report
        
        Args:
            report: Cuckoo JSON report
            
        Returns:
            Space-separated API call sequence
        """
        
        api_sequence = []
        
        try:
            # Navigate to behavior section
            behavior = report.get("behavior", {})
            processes = behavior.get("processes", [])
            
            for process in processes:
                calls = process.get("calls", [])
                
                for call in calls:
                    api_name = call.get("api", "")
                    
                    if api_name:
                        # Normalize API name
                        api_clean = self._normalize_api_name(api_name)
                        api_sequence.append(api_clean)
            
            logger.info(f"Extracted {len(api_sequence)} API calls from report")
            
            return ' '.join(api_sequence)
            
        except Exception as e:
            logger.error(f"Error extracting API calls: {e}")
            return ""
    
    @staticmethod
    def _normalize_api_name(api_name: str) -> str:
        """
        Normalize API name
        
        Remove ANSI/Unicode suffixes, convert to lowercase
        
        Args:
            api_name: Original API name
            
        Returns:
            Normalized API name
        """
        
        # Convert to lowercase
        api_name = api_name.lower()
        
        # Remove A/W suffixes
        if api_name.endswith('a') or api_name.endswith('w'):
            api_name = api_name[:-1]
        
        # Remove Ex suffix
        if api_name.endswith('ex'):
            api_name = api_name[:-2]
        
        return api_name
    
    def analyze_file(self, file_path: str, max_wait: int = 600) -> Optional[str]:
        """
        Complete analysis workflow
        
        Submit file, wait for completion, extract API calls
        
        Args:
            file_path: Path to file
            max_wait: Maximum wait time
            
        Returns:
            API call sequence or None
        """
        
        # Submit file
        task_id = self.submit_file(file_path)
        if not task_id:
            return None
        
        # Wait for completion
        if not self.wait_for_completion(task_id, max_wait):
            return None
        
        # Get report
        report = self.get_report(task_id)
        if not report:
            return None
        
        # Extract API calls
        api_sequence = self.extract_api_calls(report)
        
        return api_sequence
    
    def health_check(self) -> bool:
        """
        Check if Cuckoo is reachable
        
        Returns:
            True if Cuckoo is accessible
        """
        
        try:
            response = requests.get(f"{self.host}/", timeout=5)
            return response.status_code in [200, 302]
        except:
            return False