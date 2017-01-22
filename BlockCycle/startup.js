if (Meteor.isServer){
  Meteor.startup(function(){
	if (Images.find().count() == 0){
		for (var i=1;i<23;i++){
			Images.insert(
				{
					img_src:"img_"+i+".jpg",
					img_alt:"photo",
					obj_name:"Objet"+i,
		            obj_desc:"Available object",
		            obj_address:"Palaiseau",
		            obj_price:"0 euros",
		            createdOn:new Date(),
            		createdBy:"Company X"
				}
			);	
		}// end of for insert images
		// count the images!
		console.log("startup.js says: "+Images.find().count());
	}// end of if have no images
  });
}