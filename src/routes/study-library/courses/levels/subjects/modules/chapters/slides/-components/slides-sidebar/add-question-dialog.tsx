const AddQuestionDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    console.log(openState);
    return <div>add-question-dialog</div>;
};

export default AddQuestionDialog;
