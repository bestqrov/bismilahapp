import { Request, Response } from 'express';
import {
    getParentDashboard,
    getParentChildren,
    getParentChildrenSchedules,
    getParentChildrenGrades,
    getParentNotifications,
    getParentPayments,
    createParent,
    getParentLoginInfo,
    updateParentPassword,
} from './parents.service';
import { sendSuccess, sendError } from '../../utils/response';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const dashboard = await getParentDashboard(id);
        sendSuccess(res, dashboard, 'Dashboard retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve dashboard', 500);
    }
};

export const getChildren = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const children = await getParentChildren(id);
        sendSuccess(res, children, 'Children retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve children', 500);
    }
};

export const getChildrenSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const schedules = await getParentChildrenSchedules(id);
        sendSuccess(res, schedules, 'Children schedules retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve children schedules', 500);
    }
};

export const getChildrenGrades = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const grades = await getParentChildrenGrades(id);
        sendSuccess(res, grades, 'Children grades retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve children grades', 500);
    }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const notifications = await getParentNotifications(id);
        sendSuccess(res, notifications, 'Notifications retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve notifications', 500);
    }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const payments = await getParentPayments(id);
        sendSuccess(res, payments, 'Payments retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve payments', 500);
    }
};

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, surname, email, phone, address } = req.body;

        if (!name) {
            sendError(res, 'Name is required', 'Validation error', 400);
            return;
        }

        const parentData: any = { name };
        if (surname) parentData.surname = surname;
        if (email) parentData.email = email;
        if (phone) parentData.phone = phone;
        if (address) parentData.address = address;

        const parent = await createParent(parentData);
        sendSuccess(res, parent, 'Parent created successfully', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create parent', 400);
    }
};

export const getLoginInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const loginInfo = await getParentLoginInfo(id);
        sendSuccess(res, loginInfo, 'Login info retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve login info', 500);
    }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            sendError(res, 'New password is required', 'Validation error', 400);
            return;
        }

        const updatedInfo = await updateParentPassword(id, newPassword);
        sendSuccess(res, updatedInfo, 'Password updated successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to update password', 500);
    }
};