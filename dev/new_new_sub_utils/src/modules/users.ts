// src/modules/users.ts

export async function createUser({ email }: { email: string }) {
    // Implementation for creating a user
    return { id: '123', email };
  }
  
  export async function startTrial(userId: string, startDate: Date) {
    // Implementation for starting a trial
  }