function User(name, email) {
  this.name = name;
  this.email = email;
}

User.prototype.greet = function () {
  return `Hello, ${this.name}`;
};

User.prototype.getEmail = function () {
  return this.email;
};

module.exports = User;
