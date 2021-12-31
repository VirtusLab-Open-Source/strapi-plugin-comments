
const handleAPIError = (err = null, toggleNotification = null) => {
    toggleNotification({
        type: 'warning',
        message: { id: 'notification.error' },
    });

    if (err) {
        throw err;
    } else {
        throw new Error('error');
    }
}

export default handleAPIError;
