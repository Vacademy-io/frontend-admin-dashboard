const AddAssignmentDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    console.log(openState);
    return <div>add-assignment-dialog</div>;
};

export default AddAssignmentDialog;
