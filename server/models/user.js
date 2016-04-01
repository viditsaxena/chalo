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
      token: {type: String},
      created_at: {type: Date, default: Date.now},
      updated_at: {type: Date, default: Date.now}
});


    // pre-save "hook"- This is what happens before a user gets saved.
    UserSchema.pre('save', function(next) {
      var user = this;

      //isModified is a method on bcrypt module. Take the password user gives when signing up and hash it.
      if (user.isModified('password')) {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(user.password, salt);
        user.password = hash;
      }

      // Sets the created_at parameter equal to the current time
      // https://scotch.io/tutorials/making-mean-apps-with-google-maps-part-i
      now = new Date();
      this.updated_at = now;
      if(!this.created_at) {
          this.created_at = now
      }
      //Go back to the where save was called and execute the next line.
      next();
    });



    // helpful method to check if password is correct for when the user logs in.
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
