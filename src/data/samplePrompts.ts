import { Prompt } from '@/types/prompt';

export const samplePrompts: Prompt[] = [
  {
    id: 'sample-1',
    title: 'Professional Email Introduction',
    body: 'Hi <name>,\n\nI hope this email finds you well. My name is <your_name> and I work as a <your_role> at <your_company>.\n\nI came across your profile and was impressed by your work in <field>. I would love to connect and discuss <topic> if you have some time.\n\nBest regards,\n<your_name>',
    variables: ['name', 'your_name', 'your_role', 'your_company', 'field', 'topic'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isPinned: false,
    timesUsed: 0,
    timeSavedMinutes: 0,
  },
  {
    id: 'sample-2',
    title: 'Meeting Follow-up',
    body: 'Hi <name>,\n\nThank you for taking the time to meet with me today to discuss <meeting_topic>. I really enjoyed our conversation about <specific_point>.\n\nAs we discussed, I will <action_item> by <deadline>. Please let me know if you need any additional information from my end.\n\nLooking forward to our continued collaboration.\n\nBest,\n<your_name>',
    variables: ['name', 'meeting_topic', 'specific_point', 'action_item', 'deadline', 'your_name'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isPinned: true,
    timesUsed: 3,
    timeSavedMinutes: 15,
  },
  {
    id: 'sample-3',
    title: 'Social Media Post Template',
    body: '🚀 Exciting news! <announcement>\n\n<description>\n\n✨ Key highlights:\n• <highlight_1>\n• <highlight_2>\n• <highlight_3>\n\nWhat do you think? Share your thoughts in the comments!\n\n#<hashtag1> #<hashtag2> #<hashtag3>',
    variables: ['announcement', 'description', 'highlight_1', 'highlight_2', 'highlight_3', 'hashtag1', 'hashtag2', 'hashtag3'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isPinned: false,
    timesUsed: 1,
    timeSavedMinutes: 5,
  }
];