const express = require('express');
const router = express.Router();
const { chatController } = require('../controllers');
const { protect, ownerOrAdmin } = require('../middleware/auth');
const { 
  validateChatMessage,
  validateSearch,
  validatePagination 
} = require('../middleware/validation');
const { cache } = require('../middleware/cache');

// All chat routes require authentication
router.use(protect);

// Chat management
router.post('/', chatController.createChat);
router.get('/', validatePagination, cache(180), chatController.getUserChats);
router.get('/:chatId', cache(300), chatController.getChatById);
router.delete('/:chatId', ownerOrAdmin('creator'), chatController.deleteChat);

// Chat interactions
router.post('/:chatId/leave', chatController.leaveChat);
router.post('/:chatId/participants', ownerOrAdmin('creator'), chatController.addParticipant);
router.delete('/:chatId/participants/:participantId', ownerOrAdmin('creator'), chatController.removeParticipant);

// Messages
router.get('/:chatId/messages', validatePagination, cache(180), chatController.getChatMessages);
router.post('/:chatId/messages', validateChatMessage, chatController.sendMessage);
router.put('/:chatId/messages/:messageId', ownerOrAdmin('author'), chatController.updateMessage);
router.delete('/:chatId/messages/:messageId', ownerOrAdmin('author'), chatController.deleteMessage);

// Message interactions
router.post('/:chatId/messages/:messageId/pin', ownerOrAdmin('creator'), chatController.togglePinMessage);
router.post('/:chatId/messages/:messageId/reactions', chatController.toggleReaction);

// Chat utilities
router.post('/:chatId/read', chatController.markChatAsRead);
router.post('/:chatId/search', validateSearch, chatController.searchChatMessages);

module.exports = router;