//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

main().catch(err => console.log(err));
// npm i mongoose
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

async function main() {

  await mongoose.connect('mongodb+srv://admin-mohnish:Test1234@cluster0.vcxd5.mongodb.net/todolistDB');

  const itemsSchema = new mongoose.Schema({
    name: String
  });

  const Item = mongoose.model("Item", itemsSchema) //model 
  const item1 = new Item({
    name: "Welcome to your todolist!"
  });

  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
  });

  const List = mongoose.model("List", listSchema);

  app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("Sucessfully added the items")
          }
        });
        res.redirect("/")
      } else if (err) {
        console.log(err)
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });

      }
    });

  });

  app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
      if (err) {
        console.log(err)
      } else if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + customListName)

      } else {
        // show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }

    })

  })

  app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name: itemName
    });
    if (listName === "Today") {
      item.save();
      res.redirect("/")
    } else {
      List.findOne({ name: listName }, (err, foundList) => {
        if (!err) {
          foundList.items.push(item)
          foundList.save();
          res.redirect("/" + listName)
        }
      })
    }



  });

  app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === 'Today') {
      Item.findOneAndDelete({ _id: checkedItemId }, (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log("deleted")
        }
      })
      res.redirect("/")

    } else {
      List.findOneAndUpdate({name:listName},
        {$pull: {items:{_id:checkedItemId}}},
        (err,foundList)=>{
          if(!err){
            res.redirect("/"+listName);
          }
      });
    }




  })

  // app.get("/work", function (req, res) {
  //   res.render("list", { listTitle: "Work List", newListItems: workItems });
  // });

  app.get("/about", function (req, res) {
    res.render("about");
  });


  let port = process.env.PORT;

  app.listen(port || 3000, function () {
    console.log("Server started on port 3000");
  });


}// async main mongoose end brac