#!/usr/bin/env python3
"""
Discord API - List All Channels
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

CHANNEL_TYPES = {
    0: "TEXT",
    2: "VOICE",
    4: "CATEGORY",
    5: "ANNOUNCEMENT",
    10: "ANNOUNCEMENT_THREAD",
    11: "PUBLIC_THREAD",
    12: "PRIVATE_THREAD",
    13: "STAGE_VOICE",
    15: "FORUM",
    16: "MEDIA"
}

def list_channels(guild_id):
    """List all channels in a Discord server/guild"""

    url = f"{DISCORD_API_URL}/guilds/{guild_id}/channels"
    headers = {
        "Authorization": f"Bot {DISCORD_BOT_TOKEN}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        print(f"   {response.text}")
        return None

    channels = response.json()

    # Sort by position
    channels.sort(key=lambda x: (x.get('position', 0), x.get('name', '')))

    # Group by categories
    categories = {}
    uncategorized = []

    for channel in channels:
        channel_type = channel.get('type')
        if channel_type == 4:  # Category
            categories[channel['id']] = {
                'name': channel['name'],
                'channels': []
            }

    for channel in channels:
        channel_type = channel.get('type')
        if channel_type == 4:  # Skip categories in main loop
            continue

        parent_id = channel.get('parent_id')
        if parent_id and parent_id in categories:
            categories[parent_id]['channels'].append(channel)
        else:
            uncategorized.append(channel)

    # Display
    print("=" * 80)
    print(f"📋 CHANNELS - Yoyaku Enterprise")
    print("=" * 80)
    print()

    # Uncategorized channels
    if uncategorized:
        print("📂 NO CATEGORY")
        print("-" * 80)
        for channel in uncategorized:
            channel_type_name = CHANNEL_TYPES.get(channel.get('type'), 'UNKNOWN')
            icon = "💬" if channel.get('type') == 0 else "🔊" if channel.get('type') == 2 else "📢"

            print(f"{icon} {channel['name']}")
            print(f"   ID: {channel['id']}")
            print(f"   Type: {channel_type_name}")
            if channel.get('topic'):
                print(f"   Topic: {channel['topic']}")
            print()

    # Categorized channels
    for category_id, category_data in categories.items():
        print(f"\n📁 CATEGORY: {category_data['name']}")
        print("-" * 80)

        for channel in category_data['channels']:
            channel_type_name = CHANNEL_TYPES.get(channel.get('type'), 'UNKNOWN')
            icon = "💬" if channel.get('type') == 0 else "🔊" if channel.get('type') == 2 else "📢"

            print(f"{icon} {channel['name']}")
            print(f"   ID: {channel['id']}")
            print(f"   Type: {channel_type_name}")
            if channel.get('topic'):
                print(f"   Topic: {channel['topic']}")
            print()

    print("=" * 80)
    print(f"Total channels: {len(channels)}")
    print()
    print("💡 To modify a channel:")
    print(f"   python3 ~/tools/discord/modify-channel.py CHANNEL_ID topic 'New description'")
    print()

    return channels

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: list-channels.py SERVER_ID")
        print()
        print("To get Server ID:")
        print("  1. Right-click on server name in Discord")
        print("  2. Click 'Copy Server ID' (Developer Mode must be enabled)")
        print()
        sys.exit(1)

    guild_id = sys.argv[1]
    list_channels(guild_id)
