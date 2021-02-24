//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-alex:doras9070@cluster0.qyyx7.mongodb.net/todolistDB', {useNewUrlParser: true})

const itemsSchema = new mongoose.Schema({

    name: String
});


const Item = mongoose.model('Item', itemsSchema);

const bacon = new Item({
  name: 'bacon'
});

const lotion = new Item({
  name: 'lotion'
});

const condoms = new Item({
  name: 'condoms'
});

const itemsArray = [bacon, lotion, condoms];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);



app.get("/", function(req, res) {

  Item.find({}, (error, foundItem)=>{

    if(foundItem.length === 0)
    {
      Item.insertMany(itemsArray, (error)=>{
        if(error)
        {
          console.log(error);
        }
        else{
            console.log('success');
        }
      });
      res.redirect('/');  
    }else{
      res.render("list", {listTitle: 'Today', newListItems: foundItem});  
    }
  });
});

app.get('/:customList', (req, res)=>{

  const custom = _.capitalize(req.params.customList);

  List.findOne({name: custom}, (error, results)=>{

    if(!error)
    {
      if(!results)
      {
       //create a new list 
        const newList = new List({
          name: custom,
          items: itemsArray
        });
    
        newList.save();
        res.redirect('/'+ custom);
      }
      else{

       res.render('list', {
         listTitle: results.name, newListItems: results.items
       });

      }
    }

  });

});

app.post("/", function(req, res){

  const temp = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
      name: temp
  });

  if(listName === "Today"){

    item.save();

    res.redirect('/');
  }else{
    List.findOne({name: listName}, (error, foundlist)=>{

      foundlist.items.push(item);

      foundlist.save();

      res.redirect('/'+listName);
    })
  }

 
});

app.post('/delete',(req,res)=>{

  const checkedItem = req.body.checkbox;
  const listname  = req.body.listName; 

  if(listname === "Today"){

    Item.deleteOne({_id: checkedItem}, (error)=>{

      if(error)
      {
        console.log(error);
      }else{
        console.log('success');
        
        res.redirect('/');
      }
    });

  }else{

    List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: checkedItem}}}, (error, result)=>{

      if(!error)
      {
        res.redirect('/'+listname);
      }
    });
  }

  

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
