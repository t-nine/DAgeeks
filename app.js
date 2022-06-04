const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { body, validationResult, check } = require("express-validator");
const { toInteger } = require("lodash");
//const v=new Validator();
const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
mongoose.connect("mongodb://localhost:27017/blogDB", { useNewUrlParser: true });

const postSchema = {
  title: String,
  postoffer: String,
  difficulty: String,
  content: String,
  topictags: [String],
  sum: Number,
  count: Number,
  review: Number,
};

const Post = mongoose.model("Post", postSchema);

app.get("/",async function (req, res) {
  const posts=await Post.find({}).sort({review:-1});
  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts,
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/", function (req, res) {
  var tit = req.body.CompanyName;
  let postOffer1 = req.body.postOffer;
  let postDifficulty1 = req.body.postDifficulty;

  tit = tit.toLowerCase();
  let arr = tit.split(" ");
  for (i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  tit = arr.join(" ");

  var checkbox = [];
  if (req.body.topicTags2 != null) {
    if (typeof req.body.topicTags2 === "string") {
      checkbox.push(req.body.topicTags2);
    } else {
      checkbox = req.body.topicTags2;
    }
  } else {
    checkbox = null;
  }

  let obj = {};
  if (tit != "") {
    obj.title = tit;
  }
  if (postOffer1 != null) {
    obj.postoffer = postOffer1;
  }
  if (postDifficulty1 != null) {
    obj.difficulty = postDifficulty1;
  }
  if (checkbox != null) {
    obj.topictags = { $all: checkbox };
  }
  Post.find(JSON.parse(JSON.stringify(obj)), function (err, query) {
    if (err) return handleError(err);

    // query.forEach((element) => {
    //   console.log(element.title);
    //   console.log(element.postoffer);
    //   console.log(element.difficulty);
    //   console.log(element.content);
    //   console.log(element.topictags);
    // });
    res.render("home", {
      startingContent: homeStartingContent,
      posts: query,
    });
  });
});

app.post("/review",function (req,res) {
  var id=req.body.Review_Id;
  var star=toInteger(req.body.Review_Star);
  Post.findById(id,function (err,query) {
    query.sum=query.sum+star;
    query.count++;
    query.review=(query.sum/query.count);
    Post.findByIdAndUpdate(id,{sum: query.sum,count: query.count,review: query.review},function (err, docs) {
});
  });
  res.redirect("/");
});

app.post(
  "/compose",
  // [
  //   body('CompanyName', 'Enter A valid Company Name:').isLength({ min: 1 }),
  // ],
  function (req, res) {
    //    const errors = validationResult(req);
    //   if (!errors.isEmpty()) {
    //     const alert = errors.array();
    //     res.render('compose', { alert })
    //   }
    var tit = "" + req.body.title;
    tit = tit.toLowerCase();
    const arr = tit.split(" ");
    for (i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    tit = arr.join(" ");
    const post = new Post({
      title: tit,
      postoffer: req.body.postoffer,
      difficulty: req.body.difficulty,
      content: req.body.postBody,
      topictags: req.body.topictags,
      sum: 0,
      count: 0,
      review: 0,
    });
    // console.log(post.topictags);
    post.save(function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  }
);

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      postoffer: post.postoffer,
      difficulty: post.difficulty,
      content: post.content,
      topictags: post.topictags,
    });
  });
});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
