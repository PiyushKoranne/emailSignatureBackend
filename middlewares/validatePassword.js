const ValidatePassword = require('password-validator');
const passwordSchema = new ValidatePassword();

passwordSchema
.is().min(8)
.is().max(40)
.has().symbols()
.has().lowercase()
.has().uppercase()
.has().digits(1)

module.exports = { passwordSchema };
