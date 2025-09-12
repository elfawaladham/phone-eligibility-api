import express, {type Request, type Response} from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Phone eligibility API is running!' });
});


app.get('/check-eligibility/:phoneNumber', (req: Request, res: Response) => {
    const phoneNumber = req.params.phoneNumber;

    // Dummy logic for eligibility check

    if (!phoneNumber){
        return res.status(400).json({ error: 'Phone number is required.' });
    }

    const lastDigit = parseInt(phoneNumber.slice(-1), 10);
    const isEligible = lastDigit % 2 === 0;

    res.json({
        phoneNumber: phoneNumber,
        isEligible: isEligible,
        message: isEligible ? 'Phone number is eligible.' : 'Phone number is not eligible.'
    });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});