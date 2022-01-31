export interface Account {
    fname: string
    lname: string
    username: string
    password: string
    id: string
    isManager: string
}

export interface Reimbursement {
    name: string,
    amount: number,
    account: {
        fname: string,
        lname: string,
        id: string
    },
    id: string,
    status: string,
    statusComment?: string,
    formData: any,
}