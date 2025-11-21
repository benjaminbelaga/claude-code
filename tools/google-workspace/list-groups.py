#!/usr/bin/env python3
"""
Google Workspace API - List Groups
Benjamin Belaga - YOYAKU - 2025-11-20
"""

import os
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SERVICE_ACCOUNT_FILE = os.path.expanduser('~/.credentials/yoyaku/api-keys/google-workspace-service-account.json')
ADMIN_EMAIL = 'ben@yoyaku.fr'

SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.group'
]

def list_groups():
    """List all Google Workspace groups"""

    try:
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        delegated_credentials = credentials.with_subject(ADMIN_EMAIL)

        # Build service
        service = build('admin', 'directory_v1', credentials=delegated_credentials)

        # List groups
        print("📋 Google Workspace Groups:")
        print("=" * 60)

        results = service.groups().list(customer='my_customer').execute()
        groups = results.get('groups', [])

        if not groups:
            print("No groups found.")
        else:
            for group in groups:
                print(f"\n📧 {group['email']}")
                print(f"   Name: {group.get('name', 'N/A')}")
                print(f"   Description: {group.get('description', 'N/A')}")
                print(f"   Members: {group.get('directMembersCount', 0)}")

        print()
        print(f"Total groups: {len(groups)}")

        return groups

    except HttpError as error:
        print(f"❌ Error listing groups: {error}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    list_groups()
