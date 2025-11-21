#!/usr/bin/env python3
"""
Google Workspace API - Connection Test
Tests access to Groups, Users, Gmail, Calendar, Drive APIs
Benjamin Belaga - YOYAKU - 2025-11-20
"""

import os
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SERVICE_ACCOUNT_FILE = os.path.expanduser('~/.credentials/yoyaku/api-keys/google-workspace-service-account.json')
ADMIN_EMAIL = 'ben@yoyaku.fr'

SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.group',
    'https://www.googleapis.com/auth/admin.directory.user',
    'https://www.googleapis.com/auth/admin.directory.domain',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive'
]

def test_connection():
    print("🔧 GOOGLE WORKSPACE API - TEST DE CONNEXION")
    print("=" * 60)
    print()

    # Check if service account file exists
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"❌ Service account file not found:")
        print(f"   {SERVICE_ACCOUNT_FILE}")
        print()
        print("Run the setup first:")
        print("   /tmp/setup-workspace-api-quick.sh")
        return False

    print(f"✅ Service account file found")
    print(f"   {SERVICE_ACCOUNT_FILE}")
    print()

    try:
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)

        delegated_credentials = credentials.with_subject(ADMIN_EMAIL)
        print(f"✅ Credentials loaded")
        print(f"   Admin email: {ADMIN_EMAIL}")
        print()

        # Test 1: Admin SDK - Groups
        print("🧪 Test 1: Admin SDK - Groups API")
        try:
            admin_service = build('admin', 'directory_v1', credentials=delegated_credentials)
            results = admin_service.groups().list(customer='my_customer', maxResults=10).execute()
            groups = results.get('groups', [])
            print(f"   ✅ SUCCESS - {len(groups)} groups found")
            for group in groups[:5]:
                print(f"      • {group['email']}")
            if len(groups) > 5:
                print(f"      ... and {len(groups) - 5} more")
        except HttpError as error:
            print(f"   ❌ FAILED: {error}")
            return False
        print()

        # Test 2: Admin SDK - Users
        print("🧪 Test 2: Admin SDK - Users API")
        try:
            results = admin_service.users().list(customer='my_customer', maxResults=5).execute()
            users = results.get('users', [])
            print(f"   ✅ SUCCESS - {len(users)} users found")
            for user in users[:3]:
                print(f"      • {user['primaryEmail']}")
        except HttpError as error:
            print(f"   ❌ FAILED: {error}")
            return False
        print()

        # Test 3: Gmail API
        print("🧪 Test 3: Gmail API")
        try:
            gmail_service = build('gmail', 'v1', credentials=delegated_credentials)
            profile = gmail_service.users().getProfile(userId='me').execute()
            print(f"   ✅ SUCCESS - Gmail access OK")
            print(f"      Email: {profile['emailAddress']}")
            print(f"      Messages: {profile.get('messagesTotal', 'N/A')}")
        except HttpError as error:
            print(f"   ❌ FAILED: {error}")
            return False
        print()

        # Test 4: Calendar API
        print("🧪 Test 4: Calendar API")
        try:
            calendar_service = build('calendar', 'v3', credentials=delegated_credentials)
            calendar_list = calendar_service.calendarList().list(maxResults=3).execute()
            calendars = calendar_list.get('items', [])
            print(f"   ✅ SUCCESS - {len(calendars)} calendars accessible")
            for cal in calendars[:2]:
                print(f"      • {cal.get('summary', 'Unnamed')}")
        except HttpError as error:
            print(f"   ❌ FAILED: {error}")
            return False
        print()

        # Test 5: Drive API
        print("🧪 Test 5: Drive API")
        try:
            drive_service = build('drive', 'v3', credentials=delegated_credentials)
            results = drive_service.about().get(fields="user,storageQuota").execute()
            print(f"   ✅ SUCCESS - Drive access OK")
            print(f"      User: {results['user']['emailAddress']}")
        except HttpError as error:
            print(f"   ❌ FAILED: {error}")
            return False
        print()

        print("=" * 60)
        print("✅ ALL TESTS PASSED!")
        print()
        print("🚀 Google Workspace API is ready to use!")
        print()
        print("Next steps:")
        print("  • Create groups: ~/tools/google-workspace/create-group.py")
        print("  • List groups: ~/tools/google-workspace/list-groups.py")
        print("  • Add members: ~/tools/google-workspace/add-member.py")
        print()
        return True

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
