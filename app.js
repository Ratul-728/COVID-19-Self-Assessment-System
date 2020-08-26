var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "1234"));
var session = driver.session();

//Home
app.get('/', function(req, res){
    res.render('index');
});


//Test
app.get('/test/', function(req, res){
    res.render('test');
});

app.post('/test/result', function(req, res){
    var name = req.body.name;
    var age = req.body.age;
    var sex = req.body.sex;
    var temp = req.body.bt;

    console.log(name);
    console.log(age);
    console.log(sex);
    console.log(temp);

    var re = 0;
    
    //Symtoms
    if(req.body.bp == 1)
    {
        re += 3;
    }
    if(req.body.dc == 1)
    {
        re += 3;
    }
    if(req.body.st == 1)
    {
        re += 3;
    }
    if(req.body.w == 1)
    {
        re += 3;
    }
    if(req.body.rn == 1)
    {
        re += 3;
    }

    if(re > 3)
    {
        re = (re / 3) + 2;
    }


    //Addtional Symtoms
    if(req.body.ap == 1)
    {
        re += 2;
    }
    if(req.body.v == 1)
    {
        re += 2;
    }
    if(req.body.d == 1)
    {
        re += 2;
    }
    if(req.body.cp == 1)
    {
        re += 2;
    }
    if(req.body.mp == 1)
    {
        re += 2;
    }
    if(req.body.lts == 1)
    {
        re += 2;
    }
    if(req.body.rof == 1)
    {
        re += 2;
    }
    if(req.body.lsm == 1)
    {
        re += 2;
    }

    //Save to Database
    var resul;
    if(re < 5)
    {
        resul = "Negetive";
    }
    else
    {
        resul = "Positive";
    }
    session
        .run("CREATE(p:Person {Name:{nameParam}, Age:{ageParam}, Sex:{sexParam}, Temperature:{tempParam}, Score:{scoreParam}, Result:{resultParam}})", {nameParam:name, ageParam:age, sexParam:sex, tempParam:temp, scoreParam:re, resultParam:resul})
        .catch(function(error){
            console.log(error);

        });

    //Result
    if(re < 5)
    {
        res.render('less5');
    }
    else if(re == 5)
    {
        res.render('equal5');
    }
    if(re > 5 && re < 7)
    {
        res.render('greater5less7');
    }
    else
    {
        res.render('greater7');
    }

});

//View Result
app.get('/allresult', function(req, res){
    session
    .run("Match (n) Return n")
    .then(function(result){
        var personArr = [];
        result.records.forEach(function(record){
            //console.log(record._fields[0]);
            personArr.push({
                id:record._fields[0].identity.low,
                pname:record._fields[0].properties.Name,
                page:record._fields[0].properties.Age,
                psex:record._fields[0].properties.Sex,
                ptemp:record._fields[0].properties.Temperature,
                pscore:record._fields[0].properties.Score,
                presult:record._fields[0].properties.Result
            })
        })

        res.render('allresult', {
            persons: personArr

        })
    })
    .catch(function(error){
        console.log(error);
    })
});


app.listen(3000);

console.log('Server Open');

module.exports = app;