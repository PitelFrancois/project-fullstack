const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');

router.post('/register', userCtrl.signUp);
router.post('/login', userCtrl.signIn);
router.get('/logout', userCtrl.logout);
router.get('/', userCtrl.getAllUsers);
router.get('/:id',userCtrl.getOneUser);
router.put('/:id', userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteUser);
router.patch('/follow/:id', userCtrl.follow);
router.patch('/unfollow/:id', userCtrl.unfollow);

module.exports = router;