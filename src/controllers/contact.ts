import { Request, Response } from 'express';
import { successResponse } from '../modules/common/service';
import ContactService from '../modules/contact/service';
import { Contact } from '../modules/contact/model';
import e = require('express');

export class ContactController {

    private contactService: ContactService = new ContactService();

    public sync(req: Request, res: Response) {
        const contacts = JSON.parse(req.body.contacts);
        this.contactService.sync(contacts, (data: [Contact]) => {
            successResponse('Sync contacts successful', data, res);
        });
    }

    public update(req: Request, res: Response) {
        const query   = JSON.parse(req.body.query);
        const contact = JSON.parse(req.body.contact);
        this.contactService.update(query, contact, (data: Contact) => {
            successResponse('Update contact successful', data, res);
        });
    }

}