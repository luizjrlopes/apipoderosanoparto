
const express = require('express');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//mysql.exe -h poderosa.mysql.database.azure.com -u adminLuiz -p Tecnologia1* --ssl-mode=REQUIRED --ssl-ca=C:\Users\adminLuiz\Downloads\BaltimoreCyberTrustRoot.crt.pem
//mysql --ssl-ca=C:\Users\adminLuiz\Downloads\BaltimoreCyberTrustRoot.crt.pem -h poderosa.mysql.database.azure.com -u adminLuiz -D Poderosa
require('dotenv').config()

const authJWT =  "d6fa8591388cf429dc13074ca82be5aa";    //process.env.AUTH_JWT;


const UserModel = require('../model/UserModel')

function generateToken(params = {}) {
    return jwt.sign(params, authJWT, {
        expiresIn: 86400,
    });
}

class UserController {

    async create(req, res) {//telacadastro
        const { nome, cpf, senha, sexo, cep, email, raca, dataNasc, ultMest } = req.body

        var createHash = function (senha) {
            return bcrypt.hashSync ( senha ,  8 )
           
        }

        const user = new UserModel()
        user.nome = nome
        user.cpf = cpf
        user.senha = createHash(senha)
        user.sexo = sexo
        user.cep = cep
        user.email = email
        user.raca = raca
        user.dataNasc = dataNasc
        user.ultMest = ultMest
        await user
            .save()
            .then

            (response => {

                return res.status(200).json(response)

            })

            .catch(error => {
                return res.status(500).json(error)
            })

    }

    async update(req, res) {//editar perfil

        await UserModel.findByIdAndUpdate({ '_id': req.params.id }, req.body, { new: true })
            .then(response => {
                return res.status(200).json(response)
            })
            .catch(error => {
                return res.status(500).json("error")
            })

    }

    async updateSenha(req, res) {//editar perfil
        const user = req.body
        var createHash = function (senha) {
            return bcrypt.hashSync(senha, bcrypt.genSaltSync(10), null);
        }
        user.senha = createHash(user.senha)

        await UserModel.findByIdAndUpdate({ '_id': req.params.id }, user, { new: true })
            .then(response => {
                return res.status(200).json(response)
            })
            .catch(error => {
                return res.status(500).json("error")
            })
    }

    

    async login(req, res) {

        const cpf = req.params.cpf
        const user = new UserModel()
      
    
        
        await UserModel.findOne({'cpf': { '$eq': cpf }})
            .then(response => {

                console.log(response)
                var isValidPassword = function (response, senha) {
                    console.log(response.senha)
                    return bcrypt.compareSync(senha, response.senha);
                    
                }

                if (!isValidPassword(response, req.params.senha)) {
                    console.log('senha incorreta');
                    return res.status(404).send('senha incorreta') // redirect back to login page
                }


                if (response) {
                    console.log("response")
                    return res.status(200).send({
                        user,
                        token: generateToken({ id: user.id }),
                        cpf: response.cpf,
                        idUsuario: response._id,
                        nomeUsuario: response.nome
                        

                    });
                }
                else { return res.status(404).json({ error: 'usuario não encontrado' }) }




            })
            .catch(error => {
                return res.status(400).send("CPF não encontrado")
                console.log(response)
            })



    }



    async esqueceuSenha(req, res) {

        await UserModel.findOne({
            'cpf': { '$eq': req.params.cpf },
            'email': { '$eq': req.params.email },
            'dataNasc': { '$eq': req.params.dataNasc }
        })
            .then(response => {
                if (response) {

                    return res.status(200).send(



                        {
                            valor: true,
                            idUsuario: response._id
                        }

                    );
                }
                else
                    return res.status(404).send("Dados Incorretos")
            })
            .catch(error => {
                return res.status(500).json("error")
            })

    }
    async perfil(req, res) {

        await UserModel
            .findOne({
                '_id': { '$eq': req.params.id }

            })
            .then(response => {
                if (response) {
                    return res.status(200).send(

                        {
                            nome: response.nome,
                            cpf: response.cpf,
                            sexo: response.sexo,
                            cep: response.cep,
                            email: response.email,
                            raca: response.raca,
                            dataNasc: response.dataNasc,
                            ultMest: response.ultMest
                        }



                    )
                }

            })
            .catch(error => {
                return res.status(500).json(error)
            })

    }



    async delete(req, res) {//tela perfil - excluir usuario e tarefas -pendente

        await UserModel.deleteOne({ '_id': req.params.id })
            .then(response => {

                return res.status(200).json(response)
            })
            .catch(error => {
                return res.status(500).json(error)
            })

    }




}

module.exports = new UserController();