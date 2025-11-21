#!/usr/bin/env python3
"""
Google Workspace API - Create Group
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

def create_group(group_email, group_name, description=''):
    """Create a Google Workspace group"""

    try:
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        delegated_credentials = credentials.with_subject(ADMIN_EMAIL)

        # Build service
        service = build('admin', 'directory_v1', credentials=delegated_credentials)

        # Create group
        group_data = {
            'email': group_email,
            'name': group_name,
            'description': description
        }

        print(f"🔧 Creating group: {group_email}")
        print(f"   Name: {group_name}")
        if description:
            print(f"   Description: {description}")
        print()

        result = service.groups().insert(body=group_data).execute()

        print(f"✅ Group created successfully!")
        print(f"   Email: {result['email']}")
        print(f"   ID: {result['id']}")
        print()

        return result

    except HttpError as error:
        if error.resp.status == 409:
            print(f"⚠️  Group already exists: {group_email}")
            print(f"   You can add members to it directly")
            return None
        else:
            print(f"❌ Error creating group: {error}")
            return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: create-group.py GROUP_EMAIL GROUP_NAME [DESCRIPTION]")
        print()
        print("Example:")
        print('  create-group.py webmaster@yoyaku.fr "YOYAKU Webmasters" "Team group"')
        sys.exit(1)

    group_email = sys.argv[1]
    group_name = sys.argv[2]
    description = sys.argv[3] if len(sys.argv) > 3 else ''

    result = create_group(group_email, group_name, description)
    sys.exit(0 if result or result is None else 1)
