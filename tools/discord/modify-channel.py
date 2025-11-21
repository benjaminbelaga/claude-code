#!/usr/bin/env python3
"""
Discord API - Modify Channel
Benjamin Belaga - YOYAKU - 2025-11-20
"""

import os
import sys
import requests

# Load Discord credentials
DISCORD_BOT_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
if not DISCORD_BOT_TOKEN:
    print("❌ DISCORD_BOT_TOKEN not found")
    print("Run: source ~/.credentials/yoyaku/api-keys/discord.env")
    sys.exit(1)

DISCORD_API_URL = "https://discord.com/api/v10"

def modify_channel(channel_id, **kwargs):
    """
    Modify a Discord channel

    Args:
        channel_id: Discord channel ID
        **kwargs: Parameters to modify (name, topic, position, etc.)

    Available parameters:
        - name: Channel name (2-100 characters)
        - topic: Channel topic/description (0-1024 characters)
        - position: Sorting position
        - nsfw: Whether the channel is NSFW (True/False)
        - rate_limit_per_user: Slowmode in seconds (0-21600)
        - bitrate: Voice channel bitrate (8000-96000 for normal, 128000 for boosted)
        - user_limit: Voice channel user limit (0-99)
        - parent_id: Category ID
    """

    url = f"{DISCORD_API_URL}/channels/{channel_id}"
    headers = {
        "Authorization": f"Bot {DISCORD_BOT_TOKEN}",
        "Content-Type": "application/json"
    }

    # Filter None values
    data = {k: v for k, v in kwargs.items() if v is not None}

    if not data:
        print("❌ No parameters provided")
        return None

    print(f"🔧 Modifying channel {channel_id}...")
    for key, value in data.items():
        print(f"   {key}: {value}")
    print()

    response = requests.patch(url, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Channel modified successfully!")
        print(f"   Name: {result.get('name')}")
        print(f"   Topic: {result.get('topic', 'No topic')}")
        print(f"   Type: {result.get('type')}")
        print()
        return result
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   {response.text}")
        return None

def get_channel_info(channel_id):
    """Get channel information"""

    url = f"{DISCORD_API_URL}/channels/{channel_id}"
    headers = {
        "Authorization": f"Bot {DISCORD_BOT_TOKEN}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        channel = response.json()
        print(f"📋 Channel Info:")
        print(f"   ID: {channel.get('id')}")
        print(f"   Name: {channel.get('name')}")
        print(f"   Type: {channel.get('type')}")
        print(f"   Topic: {channel.get('topic', 'No topic')}")
        print(f"   Position: {channel.get('position')}")
        print(f"   NSFW: {channel.get('nsfw', False)}")
        if channel.get('rate_limit_per_user'):
            print(f"   Slowmode: {channel.get('rate_limit_per_user')}s")
        print()
        return channel
    else:
        print(f"❌ Error getting channel: {response.status_code}")
        print(f"   {response.text}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage:")
        print()
        print("  # Get channel info")
        print("  modify-channel.py CHANNEL_ID info")
        print()
        print("  # Modify channel description/topic")
        print("  modify-channel.py CHANNEL_ID topic 'New description'")
        print()
        print("  # Modify channel name")
        print("  modify-channel.py CHANNEL_ID name 'new-channel-name'")
        print()
        print("  # Modify multiple parameters")
        print("  modify-channel.py CHANNEL_ID name 'new-name' topic 'New topic' nsfw true")
        print()
        print("Available parameters:")
        print("  name, topic, position, nsfw, rate_limit_per_user")
        print()
        sys.exit(1)

    channel_id = sys.argv[1]

    # Info command
    if len(sys.argv) == 3 and sys.argv[2] == 'info':
        get_channel_info(channel_id)
        sys.exit(0)

    # Parse modification parameters
    modifications = {}
    i = 2
    while i < len(sys.argv):
        key = sys.argv[i]
        if i + 1 < len(sys.argv):
            value = sys.argv[i + 1]

            # Type conversion
            if key in ['position', 'rate_limit_per_user', 'bitrate', 'user_limit']:
                value = int(value)
            elif key == 'nsfw':
                value = value.lower() in ['true', '1', 'yes']

            modifications[key] = value
            i += 2
        else:
            print(f"❌ Missing value for parameter: {key}")
            sys.exit(1)

    if modifications:
        modify_channel(channel_id, **modifications)
    else:
        print("❌ No modifications specified")
        sys.exit(1)
