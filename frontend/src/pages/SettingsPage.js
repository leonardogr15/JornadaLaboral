import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import '../styles/SettingsStyle.css';

export default function SettingsPage() {

    return (
        <div className="form-panel">
            <UserForm />
            <hr />
            <br/>
            <UserTable />
        </div>
    );
}