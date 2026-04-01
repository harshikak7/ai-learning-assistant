import { nextTick } from 'process';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPdf} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import { error } from 'console';

//@desc Upload pdf document
//@route POST /api/document/upload
//@access Private

export const uploadDocument=async (req,res,next)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                error:'Please upload a pdf file',
                statusCode:400
            });
        }
        const {title}=req.body;

        if(!title){
            //Delete uploaded file if no title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success:false,
                error:'Please provide a document title',
                statusCode:400
            });
        }

        //Construct the url for uploaded file
        const baseUrl =`https://localhost:${process.env.PORT || 8000}`;
        const fileUrl=`${baseUrl}/upload/documents/${req.file.filename}`;

        //Create document record
        const document =await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath:fileUrl, //Store the url instead of local path
            fileSize:req.file.size,
            status: 'processing'  
        });

        //Procss pdf in bg 
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:',err);
        });

        res.status(201).json({
            success:true,
            data:document,
            message:'Document uploaded successfully. Processing in progress'
        });
    } catch(error){
        //Clean up file on error
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

///Helper fnc to process pdf
const processPDF = async (documentId,filePath) => {
    try{
        const {text}=await extractTextFromPdf(filePath);

        //Create chunks
        const chunks=chunkText(text,500,50);

        //update document
        await Document.findByIdAndUpdate(documentId,{
            extractedText: text,
            chunks:chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);
    } catch(error){
        console.error(`Error processing document ${documentId}:`,error);

        await Document.findByIdAndUpdate(documentId,{
            status: 'failed'
        }); 
    }
};

//@desc Get all user documents
//@route GET /api/documents
//@access Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        next(error);
    }
};

//@desc Get single document with chunks
//@route GET api/documens/:id
//@access PRIVATE
export const getDocument=async(req,res,next)=>{
    try {

    } catch(error){
    }
};

//@route Delete document
//@route DELETE api/documents/:id
//@access Private
export const deleteDocument=async(req,res,next)=>{
    try {

    } catch(error){
    }
};

//@route Update document title
//@route PUT api/documents/:id
//@access Private
export const updateDocument=async(req,res,next)=>{
    try {

    } catch(error){
    }
};
