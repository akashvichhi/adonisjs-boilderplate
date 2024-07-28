import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  // Applicable for all fields
  required: 'The {{ field }} is required',
  string: 'The value of {{ field }} must be a string',
  email: 'The {{ field }} is not a valid email address',
})
