import { createContext, useState } from 'react';
import type { AppModel } from '../App';


interface AppModelContext{
    state: ReturnType<typeof useState<AppModel>>[0];
    setState: ReturnType<typeof useState<AppModel>>[1];
};

const AppModelContext = createContext<AppModelContext | null>(null);

export default AppModelContext;
