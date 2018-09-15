var HTTPError = require('./HTTPError');
class NotExistingError extends HTTPError{
  constructor(){
    super();
    this.errorName = 'Not Found Error!';
    this.message = this.errorName;
    this.status = 404;
  }
}

module.exports = NotExistingError;