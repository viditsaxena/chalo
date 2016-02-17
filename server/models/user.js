// Require what will be needed for the model
var mongoose    =    require('mongoose'),
    randToken   =    require('rand-token'),
    bcrypt      =    require('bcrypt-nodejs');



    // Schema for the model
    var UserSchema = new mongoose.Schema({
      email: {type: String},
      password: {type: String},
      firstName: {type: String},
      lastName: {type: String},
      bio: {type: String},
      profileImage: {type: String},
      token: {type: String}
    });


    // pre-save "hook"
    UserSchema.pre('save', function(next) {
      var user = this;

      if (user.isModified('password')) {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(user.password, salt);
        user.password = hash;
      }

      next();
    });

    // method all users should have
    UserSchema.methods.sing = function(){
      return "On my own... pretending he's beside me...";
    };

    UserSchema.methods.generateToken = function(){
      var user = this;
      user.token = randToken.generate(16);
    };

    // helpful method to check if password is correct
    UserSchema.methods.authenticate = function(password, next){
      var user = this;
      bcrypt.compare(password, user.password, function(err, isMatch) {
        next(isMatch);
      });
    };

    // Create a User mongoose model based on the UserSchema
    var User = mongoose.model('User', UserSchema);

    // Export the User model
    module.exports = User;
