# User Guide: Rooms, Contacts, and Groups

Welcome to the OpenChat User Guide! This guide will help you get the most out of OpenChat's advanced features including private rooms, friend management, group chats, and AI bot integration.

---

## Table of Contents

1. [Creating Private Rooms](#creating-private-rooms)
2. [Managing Contacts (Friends)](#managing-contacts-friends)
3. [Group Chat](#group-chat)
4. [Bot Integration](#bot-integration)

---

## Creating Private Rooms

Private rooms allow you to have dedicated chat spaces separate from the public chat. You can create both **persistent** and **temporary** rooms.

### Prerequisites
- ✅ You must be **logged in** to create private rooms
- ✅ Guest users cannot create rooms

### How to Create a Private Room

#### Step 1: Access Room Creation
1. Look for the **"Rooms"** option in the sidebar or navigation menu
2. Click the **"Create Room"** or **"+"** button

#### Step 2: Choose Room Type
You'll see a modal with options:

**Room Type:**
- **Private Room** - Only invited members can join
- **Group Room** - Multiple participants with member management

**Persistence:**
- **Persistent Room** - Stays active indefinitely
- **Temporary Room** - Auto-deletes after a set time

#### Step 3: Configure Your Room

Fill in the required information:

```
Room Name: [Enter a name]
Description: [Optional description]
Room Type: [ ] Private  [ ] Group
☑ Make this room temporary
Expires in: [60] minutes
```

#### Step 4: Create the Room
- Click **"Create Room"**
- You'll be automatically added as the **Admin**
- The room will appear in your rooms list

---

### Temporary Rooms Explained

**What are temporary rooms?**
- Rooms that automatically delete after a specified time
- Perfect for quick discussions or temporary projects
- Expiration timer starts when the room is created

**Expiration Options:**
- 30 minutes
- 60 minutes (default)
- 2 hours  
- 4 hours
- 24 hours

**What happens when a room expires?**
- The room is automatically deleted
- All messages in the room are deleted
- Members are removed
- A cleanup function runs every hour to remove expired rooms

**Use Cases:**
- Quick team huddles
- Temporary project discussions
- Time-limited events or meetings

---

## Managing Contacts (Friends)

The Contacts feature lets you maintain a friends list for easy communication and group management.

### Prerequisites
- ✅ You must be **logged in**
- ✅ You need to know the username of the person you want to add

### How to Add a Contact

#### Step 1: Open Contacts Panel
1. Look for the **"Contacts"** icon in the sidebar
2. Click to open the Contacts list

#### Step 2: Search for User
1. Click the **"Add Contact"** button
2. A search dialog will appear
3. Type the username in the search box (minimum 2 characters)

```
Search Users
┌─────────────────────────────┐
│ @john                       │
└─────────────────────────────┘

Results:
┌─────────────────────────────┐
│ 👤 John Doe (@johndoe)      │
│    [+ Add]                  │
└─────────────────────────────┘
```

#### Step 3: Add User
- Click the **"Add"** button next to their name
- They'll be added to your contacts list immediately
- No confirmation required from the other user

### Managing Your Contacts

**View Contacts:**
- Open the Contacts panel to see all your contacts
- Contacts are displayed with their profile picture and username

**Set Nicknames:**
- Click on a contact
- Select **"Set Nickname"**
- Enter a custom name (e.g., "Work Friend" or "Gaming Buddy")
- The nickname is private and only visible to you

**Remove Contacts:**
- Click on a contact
- Select **"Remove Contact"**
- Confirm the removal
- This does not notify the other user

**Private Chat:**
- Click on any contact to start a private conversation
- Messages are end-to-end visible only to you and the contact

---

## Group Chat

Group chats allow multiple users to communicate in a dedicated room with advanced member management.

### Creating a Group Chat

#### Step 1: Create a Group Room
1. Follow the [Creating Private Rooms](#creating-private-rooms) steps
2. Select **"Group"** as the Room Type
3. Name your group (e.g., "Team Project" or "Study Group")
4. Click **"Create Room"**

#### Step 2: You're the Admin!
As the creator, you are automatically the **Admin** with full permissions:
- ✅ Add/remove members
- ✅ Promote members to Moderator or Admin
- ✅ Delete the group
- ✅ Manage group settings

### Adding Members to a Group

#### Step 1: Open Group Members Panel
- Select your group room from the room switcher
- On desktop: The **Group Members Panel** appears on the right side
- On mobile: Tap the members icon

#### Step 2: Add Members
1. Click the **"Add Member"** (UserPlus icon) button
2. Choose from two tabs:

**From Contacts:**
- See all your contacts who aren't already in the group
- Click **"Add"** next to their name
- They're added instantly

**Search Users:**
- Search by username (minimum 2 characters)
- Found users appear in the results
- Click **"Add"** to invite them

```
Add Members to Team Project
┌────────────────────────────────┐
│ [Contacts] [Search Users]      │
├────────────────────────────────┤
│ Contacts:                      │
│                                │
│ 👤 Alice (@alice)              │
│    [+ Add]                     │
│                                │  
│ 👤 Bob (@bob123)               │
│    [+ Add]                     │
└────────────────────────────────┘
```

### Removing Members from a Group

**As an Admin or Moderator:**
1. Open the Group Members Panel
2. Find the member you want to remove
3. Click the **"..."** (three dots) next to their name
4. Select **"Remove Member"**
5. Confirm the action

**Important:**
- Members are removed immediately
- They lose access to the group's messages
- They can be re-invited later

### Group Roles Explained

OpenChat has three role levels in groups:

#### 👑 **Admin**
- Full control over the group
- Can add/remove members
- Can promote/demote other members
- Can delete the entire group
- Can change group settings

#### 🛡️ **Moderator**
- Can add members
- Can remove regular members (not other moderators or admins)
- Cannot delete the group
- Cannot promote/demote members

#### **Member**
- Can read and send messages
- Can see group members
- Cannot manage other members

### Managing Member Roles

**Promoting Members (Admin Only):**
1. Click the **"..."** next to a member's name
2. Select:
   - **"Promote to Moderator"** (for regular members)
   - **"Promote to Admin"** (for moderators)
3. Their role badge updates immediately

**Demoting Members (Admin Only):**
1. Click the **"..."** next to a member's name  
2. Select **"Demote to Member"**
3. They lose their elevated permissions

### Leaving a Group

**As a Regular Member:**
1. Open the rooms list
2. Find your group
3. Click **"Leave Room"**
4. Confirm you want to leave

**As an Admin:**
- You can leave, but consider promoting another member to Admin first
- If you're the last admin and leave, the group may become unmanageable

---

## Bot Integration

OpenChat features an AI bot that can assist you in public chat, private rooms, and group chats.

### How to Use the Bot

The bot responds when you mention it using **@bot** in your message.

#### In Public Chat

```
You: @bot hello
Bot: Hi! How can I help you today?
```

**Example Commands:**
```
@bot what's the weather?
@bot tell me a joke
@bot help me with [topic]
```

#### In Private Rooms

1. Create or enter a private room
2. Type your message with **@bot**
3. The bot responds **only in that room**

```
[Private Room: Project Discussion]
You: @bot summarize our goals
Bot: Based on the conversation, here are the main goals...
```

**Important:**
- Bot responses in private rooms stay in that room
- Bot messages don't appear in public chat
- Each room has its own bot conversation context

#### In Group Chats

1. Select a group room
2. Mention **@bot** in a message
3. The bot responds to the entire group

```
[Group: Study Group]
Alice: @bot explain quantum physics
Bot: Quantum physics is the study of...

Bob: Thanks @bot!
```

**Group Bot Features:**
- All group members see bot responses
- Bot responses are scoped to the group
- Useful for group questions or shared information

### Bot Permissions

**Who can use the bot?**
- ✅ Registered users (in public chat, rooms, and groups)
- ✅ Guest users (in public chat only)
- ❌ Guests cannot use bot in private rooms or groups

**Rate Limiting:**
- The bot has built-in rate limiting to prevent spam
- If you send too many requests too quickly, you'll see:
  ```
  "You're sending messages too quickly. Please wait a moment."
  ```
- Wait a few seconds and try again

### Bot Limitations

**What the bot CAN do:**
- Answer general questions
- Provide information and explanations
- Assist with common tasks
- Respond to context from the current room

**What the bot CANNOT do:**
- See messages from other rooms
- Access private information
- Perform user actions (manage members, create rooms, etc.)
- Remember conversations after the session ends (currently)

---

## Tips & Best Practices

### For Rooms
- ✅ **Name rooms clearly** - Use descriptive names like "Project X Team"
- ✅ **Use temporary rooms for short discussions** - They clean up automatically
- ✅ **Use persistent rooms for long-term projects** - They stay available
- ❌ **Don't create spam rooms** - Respect the platform

### For Contacts
- ✅ **Use nicknames to organize contacts** - "Work", "Friends", "Gaming"
- ✅ **Keep your contacts list clean** - Remove inactive contacts
- ✅ **Add contacts before creating groups** - Makes group creation faster

### For Groups
- ✅ **Assign moderators in large groups** - Share the management load
- ✅ **Set clear group purposes** - Description helps members understand the goal
- ✅ **Remove inactive members** - Keeps the group focused
- ❌ **Don't add people without context** - They might not know why they're there

### For Bot Usage
- ✅ **Be specific in your questions** - Better questions = better answers
- ✅ **Use @bot at the start** - Ensures the bot recognizes the mention
- ✅ **Respect rate limits** - Space out your requests
- ❌ **Don't spam the bot** - It won't respond faster

---

## Troubleshooting

### "I can't create a room"
- ✅ Make sure you're logged in (not a guest)
- ✅ Check your internet connection
- ✅ Refresh the page and try again

### "I can't find a user to add"
- ✅ Make sure you're typing their exact username
- ✅ They must be a registered user (not a guest)
- ✅ Check for typos in the username

### "The bot isn't responding"
- ✅ Make sure you typed **@bot** in your message
- ✅ Check if you've hit the rate limit (wait a few seconds)
- ✅ Verify the bot service is running (check status in settings)

### "I can't see the Group Members Panel"
- ✅ Make sure you're in a **group** room (not a private room)
- ✅ On desktop: Panel appears on the right (hidden on small screens)
- ✅ On mobile: Look for the members icon/button

### "My room disappeared"
- ✅ Check if it was a **temporary room** - it may have expired
- ✅ Check if you left the room by mistake
- ✅ If you were removed, you won't see the room anymore

---

## Support

Need more help?

- **GitHub Issues:** [Report bugs or request features](https://github.com/michelbr84/Open-Chat.Us/issues)
- **Live Demo:** Try features at [https://open-chat.us](https://open-chat.us)
- **Documentation:** Check other docs in `/docs` folder

---

*Last updated: December 19, 2025*
