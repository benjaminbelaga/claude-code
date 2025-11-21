#!/usr/bin/env python3
"""
Google Workspace API - Add Member to Group
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
    'https://www.googleapis.com/auth/admin.directory.group',
    'https://www.googleapis.com/auth/admin.directory.group.member'
]

def add_member(group_email, member_email, role='MEMBER'):
    """Add a member to a Google Workspace group

    Args:
        group_email: Email of the group
        member_email: Email of the member to add
        role: Role (MEMBER, MANAGER, OWNER)
    """

    try:
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        delegated_credentials = credentials.with_subject(ADMIN_EMAIL)

        # Build service
        service = build('admin', 'directory_v1', credentials=delegated_credentials)

        # Add member
        member_data = {
            'email': member_email,
            'role': role
        }

        print(f"➕ Adding {member_email} to {group_email}...")

        result = service.members().insert(
            groupKey=group_email,
            body=member_data
        ).execute()

        print(f"   ✅ Added successfully (role: {role})")

        return result

    except HttpError as error:
        if error.resp.status == 409:
            print(f"   ⚠️  Already a member")
            return None
        elif error.resp.status == 404:
            print(f"   ❌ Group not found: {group_email}")
            return None
        else:
            print(f"   ❌ Error: {error}")
            return None
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: add-member.py GROUP_EMAIL MEMBER_EMAIL [ROLE]")
        print()
        print("Roles: MEMBER (default), MANAGER, OWNER")
        print()
        print("Example:")
        print('  add-member.py webmaster@yoyaku.fr seb@yoyaku.fr')
        print('  add-member.py webmaster@yoyaku.fr ben@yoyaku.fr OWNER')
        sys.exit(1)

    group_email = sys.argv[1]
    member_email = sys.argv[2]
    role = sys.argv[3] if len(sys.argv) > 3 else 'MEMBER'

    result = add_member(group_email, member_email, role)
    sys.exit(0 if result or result is None else 1)
