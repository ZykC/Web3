// this is image_share.js
Images = new Mongo.Collection("images");

Transport = new Mongo.Collection("transport");

if (Meteor.isClient) {

  var obj_id = 0;
  var identifier = 0;

  Session.set("imageLimit", 8);

  lastScrollTop = 0; 
  $(window).scroll(function(event){
    // test if we are near the bottom of the window
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
      // where are we in the page? 
      var scrollTop = $(this).scrollTop();
      // test if we are going down
      if (scrollTop > lastScrollTop){
        // yes we are heading down...
       Session.set("imageLimit", Session.get("imageLimit") + 4);
      }

      lastScrollTop = scrollTop;
    }
        
  })

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
  });

   Template.images.helpers({
    images:function(){
      if (Session.get("userFilter")){// they set a filter!
        return Images.find({createdBy:Session.get("userFilter")}, {sort:{createdOn: -1, rating:-1}});         
      }
      else {
        return Images.find({}, {sort:{createdOn: -1, rating:-1}, limit:Session.get("imageLimit")});         
      }
    },
    filtering_images:function(){
      if (Session.get("userFilter")){// they set a filter!
        return true;
      } 
      else {
        return false;
      }
    },
    getFilterUser:function(){
      if (Session.get("userFilter")){// they set a filter!
        var user = Meteor.users.findOne(
          {_id:Session.get("userFilter")});
        return user.username;
      } 
      else {
        return false;
      }
    },
    getUser:function(obj_name){
      var user = Meteor.users.findOne({obj_name:obj_name});
      if (user){
        return user.username;
      }
      else {
        return "anon";
      }
    },

    getName:function(user_id){
      //var user = Meteor.users.findOne({_id:user_id});

        return this.obj_name;

    }
  });

  Template.body.helpers({username:function(){
    if (Meteor.user()){
      return Meteor.user().username;
        //return Meteor.user().emails[0].address;
    }
    else {
      return "anonymous internet user";
    }
  }
  });

  Template.images.events({
    'click .js-image':function(event){
        $(event.target).css("width", "50px");
    }, 
    'click .js-del-image':function(event){
      //var image_id = $(this).data('id'); 
       var image_id = this._id;
       console.log(image_id);
       // use jquery to hide the image component
       // then remove it at the end of the animation
       $("#"+image_id).hide('slow', function(){
        Images.remove({"_id":image_id});
       })  
    }, 
    'click .js-rate-image':function(event){
      var rating = $(event.currentTarget).data("userrating");
      //console.log(rating);
      var image_id = this.data_id;
      console.log("Image: "+image_id+" rating now: "+rating);

    Images.update({_id:image_id}, 
                    {$set: {rating:rating}});
    }, 
    'click .js-show-image-form':function(event){
      $("#image_add_form").modal('show');
    }, 
    'click .js-acq-image-form':function(event){
      $("#image_acq_form").modal('show');
      console.log("object address:"+this.obj_address+" obj id: "+this._id);
      obj_id = this.obj_address;
      identifier = this._id;
      Transport.insert({
            _id: this._id,
            obj_address:obj_id, 
            createdOn:new Date(),
            createdBy:Meteor.user()._id
          });
    },

    'click .js-set-image-filter':function(event){
        Session.set("userFilter", this.createdBy);
    },
    'click .js-unset-image-filter':function(event){
        Session.set("userFilter", undefined);
    },
   });

  Template.image_acq_form.events({
    'submit .js-acq-image':function(event){
      var taker_address;

        taker_address = event.target.taker_address.value;
        object_address = this.obj_address;
        console.log("taker: "+taker_address+"object address:"+object_address);
        if (Meteor.user()){

          Transport.update({_id:identifier}, 
                    {$set: {taker_address:taker_address}});

          console.log(obj_id);
      }
        $("#image_acq_form").modal('hide');
     return false;
    }
  });

  Template.image_add_form.events({
    'submit .js-add-image':function(event){
      var img_src, obj_name, img_alt, obj_desc, obj_address, obj_price;

        img_src = event.target.img_src.value;
        img_alt = "photo";
        obj_name = event.target.obj_name.value;
        obj_desc = event.target.obj_desc.value;
        obj_address = event.target.obj_address.value;
        obj_price = event.target.obj_price.value;

        console.log("src: "+img_src+" alt:"+img_alt);
        console.log("desc: "+obj_desc+" address:"+obj_address);
        console.log("price: "+obj_price);
        if (Meteor.user()){
          Images.insert({
            img_src:img_src,
            img_alt:"photo",
            obj_name:obj_name,
            obj_desc:obj_desc,
            obj_address:obj_address,
            obj_price:obj_price,
            createdOn:new Date(),
            createdBy:Meteor.user()._id
          });
      }
        $("#image_add_form").modal('hide');
     return false;
    }
  });

  

}

