# Planning Poker User Guide

This guide explains how to use Planning Poker as either an Admin or a Player. It is intended for first-time users and covers the complete process from joining a session to recording final estimates.

## 1. Purpose

Planning Poker helps Scrum teams estimate the relative effort, complexity, risk, and uncertainty of tickets.

Participants estimate independently. Their choices remain hidden until the Admin reveals all submitted cards. The team then discusses any differences and agrees on a final estimate.

The application supports:

- Real-time estimation sessions
- Admin and Player roles
- Story point values of `1, 2, 3, 5, 8, 13, and 21`
- Hidden voting followed by a controlled reveal
- Multiple voting rounds for each ticket
- Final consensus estimates
- Sprint-based ticket management
- Round and sprint history

## 2. Requirements

Before using the application, each participant needs:

1. A supported web browser.
2. A GitHub account.
3. A stable internet connection.

Use a current version of Chrome, Edge, Firefox, or Safari where possible.

All users must sign in with GitHub. The application uses the GitHub username as the participant's display name.

## 3. Roles and Permissions

| Action | Admin | Player |
| --- | --- | --- |
| Create a session and share its link | Yes | No |
| Create, select, and complete sprints | Yes | No |
| Create, edit, select, and delete tickets | Yes | No |
| Submit and update a personal vote | Yes | Yes |
| Reveal submitted votes | Yes | No |
| Start another voting round | Yes | No |
| Confirm the final estimate | Yes | No |
| View tickets, results, and round history | Yes | Yes |
| End the session | Yes | No |

An Admin may also vote as a normal participant.

## 4. Page Status

The top of the room displays:

- `Realtime`: the live connection is working.
- `Connecting`: the application is establishing or restoring its connection.
- `Admin` or `Player`: the current role.
- Your GitHub username.
- The number of online connections.
- `Leave`: exits the current room.

The theme control in the application header can switch between light and dark modes.

## 5. Admin Instructions

### 5.1 Create a Session

1. Open Planning Poker.
2. Select `Create session`.
3. If required, select `Sign in with GitHub` and complete the sign-in process.
4. Select `Create session` again after signing in.
5. Confirm that the room header displays `Admin`.

The browser used to create the session stores the room's Admin credential locally.

### 5.2 Invite Players

1. Find `Player room link` near the top of the page.
2. Select `Copy link`.
3. Send the copied link to the participants.

Players do not need a separate room password.

### 5.3 Create or Select a Sprint

A sprint must be created or selected before tickets can be added.

1. Select `Sprints`.
2. Enter a sprint name under `Create sprint`, such as `Sprint 16`.
3. Select a duration:
   - `5 working days`
   - `10 working days`
   - `Custom`, followed by a number greater than zero
4. Select `Create and select`.
5. Confirm that the correct sprint appears under `Current sprint`.

To use an existing incomplete sprint, open `Sprints` and select it from `Available sprints`.

### 5.4 Create a Ticket

1. Select `Tickets` in the current ticket section.
2. Select `Create ticket`.
3. Enter a title. This field is required.
4. Enter a useful description of the scope, acceptance criteria, risks, and known uncertainties.
5. Select `Create and select`.

The application automatically:

- Adds the ticket to the current sprint.
- Selects the new ticket.
- Creates voting round 1 for the ticket.

### 5.5 Manage Tickets

Open `Tickets` to:

- Select the active ticket.
- Create another ticket.
- Review which tickets have final estimates.
- Delete a ticket.

Select `Edit` in the `Current ticket` section to update the active ticket's title or description.

Deleting a ticket removes it from the active ticket list. Existing round and vote records are not deleted from the underlying collections, so confirm that the ticket is no longer needed before deleting it.

### 5.6 Prepare a Vote

Before voting begins:

1. Confirm that the correct sprint is selected.
2. Confirm that the correct ticket is active.
3. Explain the ticket's scope and acceptance criteria.
4. Answer clarification questions.
5. Ask each participant to estimate independently.

The vote board shows:

- `Submitted` for participants who have voted.
- `Waiting` for participants who have not voted.

Votes remain hidden until the Admin reveals them.

The application does not require every participant to vote before revealing. The Admin should check the board and confirm that all expected participants have submitted.

### 5.7 Reveal and Discuss Votes

After at least one vote has been submitted, select `Reveal cards`.

The application displays:

- Each participant's story point.
- `Average`: the average of all submitted votes.
- `Most common`: the most frequently selected value. Multiple values may be shown after a tie.
- `Spread`: the range between the lowest and highest votes.

Select a revealed participant card to read their optional vote reason.

Votes cannot be changed after the round has been revealed.

During the discussion, focus on the reasons for the highest and lowest estimates. The displayed statistics are guidance, not an automatically selected result.

### 5.8 Start Another Round

If the team has not reached agreement:

1. Select `Start new round`.
2. Ask every participant to submit a new vote.
3. Check that the expected participants have submitted.
4. Select `Reveal cards` again.

Previous rounds remain available under `Rounds` for comparison.

### 5.9 Confirm the Final Estimate

When the team reaches agreement:

1. Find `Facilitator controls`.
2. Select the agreed value from `Final estimate`.
3. Select `Confirm consensus`.
4. Confirm that the final point value appears on the ticket.

The final estimate does not need to match the average or most common vote. It should represent the team's decision after discussion.

### 5.10 Continue to the Next Ticket

1. Select `Tickets`.
2. Select an existing ticket or create a new one.
3. Repeat the voting, reveal, discussion, and consensus process.

When the Admin changes the active ticket, Players in the room receive the updated ticket.

### 5.11 Complete and Manage a Sprint

The current sprint summary contains:

- `Duration`: the configured number of working days.
- `Total points`: the sum of confirmed final estimates.
- `Points/day`: total confirmed points divided by sprint duration.
- `Avg velocity`: the average total points from completed, unarchived sprints.

After all required tickets have final estimates:

1. Select `Sprints`.
2. Select `Complete sprint`.
3. Confirm that the sprint appears under `Sprint history`.

Completed sprints can be:

- `Archived`: retained in history but excluded from average velocity.
- `Unarchived`: included in average velocity again.

A completed sprint is locked. Tickets, votes, and estimates within it can no longer be changed. Create or select another incomplete sprint to continue working.

### 5.12 End the Session

When the entire estimation session is finished:

1. Select `End session`.
2. Confirm by selecting `End session` in the confirmation dialog.

After the session ends:

- Existing tickets, rounds, votes, and estimates remain visible.
- New changes are disabled.
- Players are informed that the session has ended.

Ending a session affects everyone. It is different from selecting `Leave`, which only removes the current user from the room.

## 6. Player Instructions

### 6.1 Join from a Shared Link

The recommended process is:

1. Open the room link supplied by the Admin.
2. Select `Sign in with GitHub` if required.
3. Complete the GitHub sign-in process.
4. Select `Join session`.
5. Confirm that the room header displays `Player`.

To join manually:

1. Open Planning Poker.
2. Select `Join session`.
3. Paste the full room link or enter the room ID.
4. Sign in with GitHub.
5. Select `Join session`.

### 6.2 Review the Active Ticket

Before voting, confirm:

- The correct sprint appears under `Current sprint`.
- The expected ticket appears under `Current ticket`.
- You have read and understood the ticket description.

Players can select:

- `Tickets` to view tickets in the current sprint.
- `Rounds` to view previous rounds for the active ticket.

Only the Admin can change the active sprint or ticket.

### 6.3 Submit a Vote

1. Select one of the story point cards.
2. Optionally enter a note explaining risk, complexity, uncertainty, or assumptions.
3. Select `Submit vote`.
4. Confirm that the `Submitted` status appears.

Available values are:

`1, 2, 3, 5, 8, 13, and 21`

Before the Admin reveals the round, you may select another card or edit your note and then select `Update vote`.

### 6.4 Review Revealed Votes

After the Admin selects `Reveal cards`:

- Every submitted story point becomes visible.
- The average, most common value, and vote spread are displayed.
- Participant cards with notes can be opened to view their reasons.
- Votes for the current round can no longer be changed.

Discuss the reasoning behind different estimates rather than selecting the average automatically.

### 6.5 Vote in Another Round

When the Admin starts another round:

1. Consider the information raised during the discussion.
2. Select a new story point.
3. Add or update your note if useful.
4. Select `Submit vote`.

Each round requires a new submission. A vote from the previous round is not copied automatically.

### 6.6 Leave the Room

Select `Leave` in the room header to exit.

Leaving does not end the session or remove votes already submitted. Open the shared room link again if you need to rejoin.

## 7. Recommended Meeting Process

The Admin should normally run an estimation meeting in this order:

1. Create the session and share the Player link.
2. Create or select the sprint.
3. Create the tickets and provide clear descriptions.
4. Confirm that all participants have joined.
5. Present the active ticket and answer questions.
6. Ask everyone to estimate independently.
7. Check submission statuses and reveal the cards.
8. Ask participants with the highest and lowest estimates to explain their reasoning.
9. Start another round if the team has not reached agreement.
10. Confirm the final consensus estimate.
11. Select the next ticket and repeat the process.
12. Complete the sprint when all required estimates are recorded.
13. End the session when the meeting is finished.

## 8. Admin Access and Browser Data

The current version determines Admin access using a room-owner credential stored locally in the browser that created the session.

Important limitations:

- Continue using the same browser and browser profile after creating a session.
- Do not clear local storage, cookies, or site data during an active session.
- Creating a room in a private or incognito window may cause Admin access to be lost when that window closes.
- Opening the room on another computer or browser normally gives Player access.
- On a shared computer, another person using the same browser profile may retain Admin access to the room.
- Selecting `Leave` does not remove the locally stored Admin credential.

For reliable use, a designated facilitator should create and manage the session from their own device in a normal browser window.

## 9. Troubleshooting

### A Ticket Cannot Be Created

Open `Sprints` and create or select an incomplete sprint. Tickets cannot be added to a completed sprint.

### Vote Values Are Not Visible

This is expected before reveal. The board shows only whether each participant has submitted. Values become visible after the Admin selects `Reveal cards`.

### A Submitted Vote Needs to Be Changed

Before reveal, select another card and then select `Update vote`. After reveal, the vote cannot be changed. The Admin must start another round.

### The Admin Can Reveal Before Everyone Has Voted

The application enables reveal after at least one vote. It does not enforce full participation. The Admin must check the `Waiting` and `Submitted` statuses before revealing.

### The Page Remains on Connecting

1. Wait a few seconds.
2. Check the network connection.
3. Refresh the page.
4. Reopen the room link.
5. Confirm that the GitHub session is still active.

### A Player Does Not See the Latest State

Confirm that the connection status is `Realtime`. If the state remains outdated, refresh the page or leave and reopen the shared room link.

### The Admin Now Appears as a Player

The room may have been opened from a different browser, device, or browser profile, or local browser data may have been cleared. Return to the browser environment that originally created the session.

### Must the Final Estimate Match the Average?

No. The Admin records the team's agreed estimate after discussion. Vote statistics are only supporting information.

### What Is the Difference Between Complete Sprint and End Session?

- `Complete sprint` saves and locks the current sprint. The session may continue with another sprint.
- `End session` ends the entire room and disables all further changes.

### Does Archive Delete a Sprint?

No. Archiving retains the completed sprint in history but excludes it from the average velocity calculation.

## 10. Terminology

| Term | Meaning |
| --- | --- |
| Session | A shared Planning Poker estimation room |
| Admin | The room creator and meeting facilitator |
| Player | A participant who joins through the shared link |
| Sprint | A group of tickets within an estimation period |
| Ticket | A requirement, task, or user story being estimated |
| Round | One voting attempt for the active ticket |
| Story Point | A relative measure of effort, complexity, risk, and uncertainty |
| Final Estimate | The story point value agreed by the team |
| Velocity | A measure based on the total points in completed sprints |
