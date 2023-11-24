const express = require('express');
const routes = express.Router();
const user = require('./models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const post = require('./models/Post');

const upload = multer({dest:'uploads'})
const fs = require('fs');

routes.post('/register',async(req,res)=>{
    try{
        const {username,password} = req.body.send
        const createdUser = await user.create({username,password});
        res.json(createdUser);
    }catch(err){
        res.json({"msg":"username already exist\nerror occured while registering user"});
    }
})

routes.post('/login',async(req,res)=>{
    try{
        let loggedUser = await user.findOne({username:req.body.send.username});
        if(loggedUser!==null){
            if(req.body.send.password===loggedUser.password){
                jwt.sign({username:loggedUser.username, id:loggedUser.id},"hari1234",{},(err,token)=>{
                    if(err) throw err;
                    res.cookie('token',token,{
                        httpOnly:true,
                        secure:true,
                        domain:".app.localhost"
                    }).json({
                        msg:"login successfull",
                        username:loggedUser.username,
                        id:loggedUser._id
                    });
                } )
            }else{
                res.json({"msg":"wrong credentials"});
            }
        }else{
            res.json({"msg":"user not found"});
        }
    }catch(err){
        res.json({"msg":"error while logging in"});
    }
})

routes.get('/profile',async(req,res)=>{
    try{
        let token = req.cookies.token;
        await jwt.verify(token,"hari1234",(err,info)=>{
            if(err) throw err;
            res.json(info);
        })
    }catch(err){
        res.json(err);
    }
})

routes.get('/logout',(req,res)=>{
    try{
        res.cookie('token','',{httpOnly:true}).json('ok');
    }catch(err){
        res.json(err);
    }
})


routes.get('/allPosts',async(req,res)=>{
    res.json(await post.find()
    .populate('author',['username'])
    .sort({updatedAt:-1})
    );
})


routes.get('/post/:id',async(req,res)=>{
   try{
    const {id} = req.params
    const token = req.cookies.token;

    jwt.verify(token,"hari1234",async(err,info)=>{
        const postData  = await post.findById(id).populate('author',['username']);
        if(err){
            return res.json({postData,err});
        }
        res.json({postData,info})        
    })

   }catch(err){
    res.json(err);
   }
})



routes.delete('/delete/:id',async(req,res)=>{
    const {id} = req.params;
    try{
        await post.deleteOne({_id:id});
        res.json({"msg":"task deleted"});
    }catch(err){
        throw err;
    }
})




routes.post('/createPost',upload.single('file'),async(req,res)=>{
    try{
        const {originalname,path} = req.file
        const parts = originalname.split('.');
        const ext = parts[parts.length-1];
        const newPath = path+'.'+ext;
        fs.renameSync(path,newPath);
        
        const {title,summary,content} = req.body;
        const {token} = req.cookies

        jwt.verify(token,"hari1234",{},async(err,info)=>{
            if(err){
                return res.json(err);
            }
            const postDoc =await post.create({
                'title':title,
                'summary':summary,
                'content':content,
                'file':newPath,
                author:info.id,
            })
            res.json(postDoc)

        })
    }catch(err){
        res.json(err);
    }
}
);

routes.put('/update/:id',upload.single('file'),async(req,res)=>{
    try{
    const {id} = req.params
    let newPath = null;
    if(req.file){
        const {originalname,path} = req.file
        const parts = originalname.split('.');
        const ext = parts[parts.length-1];
        newPath = path+'.'+ext;
        fs.renameSync(path,newPath);
    }
    const {title,summary,content} = req.body
    const postDoc = await post.findById(id);
    await postDoc.updateOne({
        title,
        summary,
        content,
        file: newPath? newPath: postDoc.file
    })

    res.json({postDoc,msg:"updated"});
    }
    catch(err){
        res.json(err);
    }
})

routes.get('/myPosts',async(req,res)=>{
    try{
        const {token} = req.cookies;
        
        jwt.verify(token,"hari1234",async(err,info)=>{
            if(err){
                return res.json(err);
            }
            const userPosts =await post.find({author:info.id}).populate('author',['username']).sort({updatedAt:-1});
            return res.json(userPosts);
        })
    }catch(err){
        res.json(err);
    }
})



module.exports = routes;
